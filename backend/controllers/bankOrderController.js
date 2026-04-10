const BankOrder = require('../models/BankOrder');
const Horse = require('../models/Horse');
const Transaction = require('../models/Transaction');
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const Notification = require('../models/Notification');
require('dotenv').config();

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

// Multer config for payment proof
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadProof = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const isValid = allowed.test(file.mimetype);
    isValid ? cb(null, true) : cb(new Error('Invalid file type'));
  },
});

// @desc    Create bank order
// @route   POST /api/bankorders
const createBankOrder = async (req, res) => {
  try {
    const {
      horseId, buyerWallet, buyerName,
      buyerPhone, buyerEmail, buyerBank, buyerRIB,
    } = req.body;

    const horse = await Horse.findById(horseId);
    if (!horse) {
      return res.status(404).json({ success: false, message: 'Horse not found' });
    }
    if (!horse.isForSale) {
      return res.status(400).json({ success: false, message: 'Horse is not for sale' });
    }

    // Convert ETH to MAD (1 ETH ≈ 35000 MAD approximation)
    const ethToMAD = 35000;
    const priceInMAD = horse.price * ethToMAD;

    const order = await BankOrder.create({
      horseId,
      horseName: horse.name,
      horseImage: horse.imageUrl,
      horsePrice: horse.price,
      priceInMAD,
      buyerWallet: buyerWallet.toLowerCase(),
      buyerName,
      buyerPhone,
      buyerEmail,
      buyerBank,
      buyerRIB,
      sellerWallet: horse.owner.toLowerCase(),
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Upload payment proof
// @route   PUT /api/bankorders/:id/proof
const uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // First get the order before updating
    const existingOrder = await BankOrder.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const filePath = req.file.path;
    const readableStream = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: { name: `payment_proof_${req.params.id}` },
      pinataOptions: { cidVersion: 0 },
    };

    const result = await pinata.pinFileToIPFS(readableStream, options);
    fs.unlinkSync(filePath);

    const proofUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

    const order = await BankOrder.findByIdAndUpdate(
      req.params.id,
      {
        paymentProof: result.IpfsHash,
        paymentProofUrl: proofUrl,
        status: 'payment_sent',
      },
      { new: true }
    );

    // Notify seller
    await Notification.create({
      walletAddress: existingOrder.sellerWallet.toLowerCase(),
      type: 'payment_sent',
      message: `${existingOrder.buyerName} has sent payment for ${existingOrder.horseName}!`,
      orderId: existingOrder._id,
      horseName: existingOrder.horseName,
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm bank order (seller confirms payment received)
// @route   PUT /api/bankorders/:id/confirm
const confirmBankOrder = async (req, res) => {
  try {
    const order = await BankOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update order status
    order.status = 'confirmed';
    order.confirmedAt = new Date();
    await order.save();

    // Update horse ownership in MongoDB
    const horse = await Horse.findByIdAndUpdate(
      order.horseId,
      {
        owner: order.buyerWallet.toLowerCase(),
        isForSale: false,
      },
      { new: true }
    );

    // Record transaction
    await Transaction.create({
      type: 'buy',
      horseId: order.horseId,
      horseName: order.horseName,
      horseImage: order.horseImage,
      from: order.sellerWallet.toLowerCase(),
      to: order.buyerWallet.toLowerCase(),
      price: order.horsePrice,
      transactionHash: `bank_transfer_${order._id}`,
      status: 'confirmed',
    });

    console.log(`✅ Horse ${horse.name} transferred to ${order.buyerWallet}`);

    res.json({ success: true, data: order, horse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel bank order
// @route   PUT /api/bankorders/:id/cancel
const cancelBankOrder = async (req, res) => {
  try {
    const order = await BankOrder.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancelledAt: new Date() },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders by buyer wallet
// @route   GET /api/bankorders/buyer/:walletAddress
const getOrdersByBuyer = async (req, res) => {
  try {
    const orders = await BankOrder.find({
      buyerWallet: req.params.walletAddress.toLowerCase(),
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders by seller wallet
// @route   GET /api/bankorders/seller/:walletAddress
const getOrdersBySeller = async (req, res) => {
  try {
    const orders = await BankOrder.find({
      sellerWallet: req.params.walletAddress.toLowerCase(),
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/bankorders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await BankOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadProof,
  createBankOrder,
  uploadPaymentProof,
  confirmBankOrder,
  cancelBankOrder,
  getOrdersByBuyer,
  getOrdersBySeller,
  getOrderById,
};