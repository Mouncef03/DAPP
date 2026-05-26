const Horse = require('../models/Horse');
const Transaction = require('../models/Transaction');
const BankOrder = require('../models/BankOrder');
const Auction = require('../models/Auction');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
const getDashboardStats = async (req, res) => {
  try {
    // ─── General Stats ────────────────────────────────────
    const totalHorses = await Horse.countDocuments();
    const horsesForSale = await Horse.countDocuments({ isForSale: true });
    const horsesSold = await Horse.countDocuments({ isForSale: false });

    // ─── Transaction Stats ────────────────────────────────
    const totalTransactions = await Transaction.countDocuments();
    const ethTransactions = await Transaction.countDocuments({ type: 'buy', transactionHash: { $not: /bank_transfer/ } });
    const bankTransactions = await BankOrder.countDocuments({ status: 'confirmed' });

    // ─── Volume Stats ─────────────────────────────────────
    const ethVolumeResult = await Transaction.aggregate([
      { $match: { type: 'buy', transactionHash: { $not: /bank_transfer/ } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const ethVolume = ethVolumeResult[0]?.total || 0;

    const madVolumeResult = await BankOrder.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$priceInMAD' } } }
    ]);
    const madVolume = madVolumeResult[0]?.total || 0;

    // ─── Auction Stats ────────────────────────────────────
    const totalAuctions = await Auction.countDocuments();
    const activeAuctions = await Auction.countDocuments({ status: 'active' });
    const endedAuctions = await Auction.countDocuments({ status: 'ended' });

    // ─── Sales by Day (last 7 days) ───────────────────────
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const daySales = await Transaction.countDocuments({
        type: 'buy',
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const dayVolume = await Transaction.aggregate([
        { $match: { type: 'buy', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]);

      last7Days.push({
        date: startOfDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: daySales,
        volume: dayVolume[0]?.total || 0,
      });
    }

    // ─── Top Sellers ──────────────────────────────────────
    const topSellers = await Transaction.aggregate([
      { $match: { type: 'buy' } },
      { $group: { _id: '$from', totalSales: { $sum: 1 }, totalVolume: { $sum: '$price' } } },
      { $sort: { totalVolume: -1 } },
      { $limit: 5 },
    ]);

    // ─── Top Buyers ───────────────────────────────────────
    const topBuyers = await Transaction.aggregate([
      { $match: { type: 'buy' } },
      { $group: { _id: '$to', totalPurchases: { $sum: 1 }, totalSpent: { $sum: '$price' } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]);

    // ─── Payment Methods ──────────────────────────────────
    const paymentMethods = [
      { name: 'ETH (Crypto)', value: ethTransactions, color: '#f59e0b' },
      { name: 'Bank Transfer (MAD)', value: bankTransactions, color: '#10b981' },
    ];

    // ─── Recent Activity ──────────────────────────────────
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: {
          totalHorses,
          horsesForSale,
          horsesSold,
          totalTransactions,
          ethVolume: ethVolume.toFixed(4),
          madVolume: madVolume.toLocaleString(),
          totalAuctions,
          activeAuctions,
          endedAuctions,
        },
        salesByDay: last7Days,
        topSellers,
        topBuyers,
        paymentMethods,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };