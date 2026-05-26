const Auction = require('../models/Auction');
const Horse = require('../models/Horse');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { ethers } = require('ethers');
const HorseNFTABI = require('../config/abi/HorseMarketplace.json');
require('dotenv').config();

const getContract = () => {
  const provider = new ethers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545'
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    HorseNFTABI.abi,
    wallet
  );
};

// @desc    Start auction
// @route   POST /api/auctions
const startAuction = async (req, res) => {
  try {
    const { horseId, startingPrice, durationInHours, seller } = req.body;

    const horse = await Horse.findById(horseId);
    console.log('🔍 Horse found:', horse.name);
     console.log('🔍 Token ID:', horse.tokenId, typeof horse.tokenId);
      console.log('🔍 Seller:', seller);
      console.log('🔍 Starting Price:', startingPrice);
     console.log('🔍 Duration:', durationInHours);
    if (!horse) {
      return res.status(404).json({ success: false, message: 'Horse not found' });
    }

    // Start auction on blockchain
    const contract = getContract();
    const priceInWei = ethers.parseEther(startingPrice.toString());
    const tx = await contract.startAuction(
      horse.tokenId,
      priceInWei,
      durationInHours
    );
    const receipt = await tx.wait();
    console.log('✅ Blockchain tx confirmed:', receipt.hash);
console.log('🔍 Horse ID:', horseId);
console.log('🔍 End time:', endTime);

    const endTime = new Date();
    endTime.setHours(endTime.getHours() + parseInt(durationInHours));

    // Save auction to MongoDB
    const auction = await Auction.create({
      horseId,
      horseName: horse.name,
      horseImage: horse.imageUrl,
      tokenId: horse.tokenId,
      seller: seller.toLowerCase(),
      startingPrice,
      durationInHours,
      endTime,
      transactionHash: receipt.hash,
    });

    // Update horse status
    await Horse.findByIdAndUpdate(horseId, { isForSale: false });

    res.status(201).json({ success: true, data: auction });
    } catch (error) {
    console.error('❌ Full error:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(400).json({ success: false, message: error.message });
  }
};

    // @desc    Save auction to MongoDB only (blockchain already done)
// @route   POST /api/auctions/save
const saveAuction = async (req, res) => {
  try {
    const { horseId, startingPrice, durationInHours, seller, transactionHash } = req.body;

    const horse = await Horse.findById(horseId);
    if (!horse) {
      return res.status(404).json({ success: false, message: 'Horse not found' });
    }

    const endTime = new Date();
    endTime.setHours(endTime.getHours() + parseInt(durationInHours));

    const auction = await Auction.create({
      horseId,
      horseName: horse.name,
      horseImage: horse.imageUrl,
      tokenId: horse.tokenId,
      seller: seller.toLowerCase(),
      startingPrice,
      durationInHours,
      endTime,
      transactionHash: transactionHash || '',
    });

    // Update horse status
    await Horse.findByIdAndUpdate(horseId, { isForSale: false });

    res.status(201).json({ success: true, data: auction });
  } catch (error) {
    console.error('❌ Save auction error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Place bid
// @route   POST /api/auctions/:id/bid
const placeBid = async (req, res) => {
  try {
    const { bidder, amount, transactionHash } = req.body;

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }
    if (auction.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Auction is not active' });
    }
    if (amount <= auction.highestBid) {
      return res.status(400).json({ success: false, message: 'Bid must be higher than current highest bid' });
    }

    // Add bid to auction
    auction.bids.push({ bidder: bidder.toLowerCase(), amount, transactionHash });
    auction.highestBid = amount;
    auction.highestBidder = bidder.toLowerCase();
    await auction.save();

    // Notify seller
       await Notification.create({
  walletAddress: auction.seller,
  type: 'payment_sent',
  message: `🔨 New bid of ${amount} ETH on ${auction.horseName}! Go to Auctions to accept.`,
  orderId: auction._id,
  horseName: auction.horseName,
});

    res.json({ success: true, data: auction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept bid (seller ends auction)
// @route   PUT /api/auctions/:id/accept
const acceptBid = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }
    if (!auction.highestBidder) {
      return res.status(400).json({ success: false, message: 'No bids placed' });
    }

    // Accept bid on blockchain
    const contract = getContract();
    const tx = await contract.acceptBid(auction.tokenId);
    const receipt = await tx.wait();

    // Update auction
    auction.status = 'ended';
    auction.winner = auction.highestBidder;
    auction.finalPrice = auction.highestBid;
    auction.transactionHash = receipt.hash;
    await auction.save();

    // Update horse ownership
    await Horse.findByIdAndUpdate(auction.horseId, {
      owner: auction.highestBidder,
      isForSale: false,
    });

    // Record transaction
    await Transaction.create({
      type: 'buy',
      horseId: auction.horseId,
      horseName: auction.horseName,
      horseImage: auction.horseImage,
      from: auction.seller,
      to: auction.highestBidder,
      price: auction.highestBid,
      transactionHash: receipt.hash,
      status: 'confirmed',
    });

    // Notify winner
    await Notification.create({
      walletAddress: auction.highestBidder,
      type: 'order_confirmed',
      message: `🎉 You won the auction for ${auction.horseName} with ${auction.highestBid} ETH!`,
      orderId: auction._id,
      horseName: auction.horseName,
    });

    res.json({ success: true, data: auction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel auction
// @route   PUT /api/auctions/:id/cancel
const cancelAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    const contract = getContract();
    const tx = await contract.cancelAuction(auction.tokenId);
    await tx.wait();

    auction.status = 'cancelled';
    await auction.save();

    await Horse.findByIdAndUpdate(auction.horseId, { isForSale: true });

    res.json({ success: true, data: auction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get auction by horse
// @route   GET /api/auctions/horse/:horseId
const getAuctionByHorse = async (req, res) => {
  try {
    const auction = await Auction.findOne({
      horseId: req.params.horseId,
      status: 'active',
    });
    res.json({ success: true, data: auction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active auctions
// @route   GET /api/auctions
const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' }).sort({ endTime: 1 });
    res.json({ success: true, count: auctions.length, data: auctions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get auctions by seller
// @route   GET /api/auctions/seller/:walletAddress
const getAuctionsBySeller = async (req, res) => {
  try {
    const auctions = await Auction.find({
      seller: req.params.walletAddress.toLowerCase(),
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: auctions.length, data: auctions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  startAuction,
  saveAuction,
  placeBid,
  acceptBid,
  cancelAuction,
  getAuctionByHorse,
  getAllAuctions,
  getAuctionsBySeller,
};