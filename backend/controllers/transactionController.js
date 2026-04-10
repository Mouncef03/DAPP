const Transaction = require('../models/Transaction');

// @desc    Get transactions by wallet address
// @route   GET /api/transactions/:walletAddress
const getTransactionsByWallet = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const transactions = await Transaction.find({
      $or: [
        { from: walletAddress.toLowerCase() },
        { to: walletAddress.toLowerCase() },
      ],
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      from: req.body.from.toLowerCase(),
      to: req.body.to ? req.body.to.toLowerCase() : '',
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getTransactionsByWallet, createTransaction };