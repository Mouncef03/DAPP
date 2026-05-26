const Horse = require('../models/Horse');
const Transaction = require('../models/Transaction');
const {
  mintHorseNFT,
  getHorsesForSaleFromBlockchain,
  updateHorsePriceOnBlockchain,
} = require('../services/blockchainService');

// @desc    Get all horses
// @route   GET /api/horses
const getAllHorses = async (req, res) => {
  try {
    const horses = await Horse.find({});
    res.json({ success: true, count: horses.length, data: horses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single horse
// @route   GET /api/horses/:id
const getHorseById = async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);
    if (!horse) {
      return res.status(404).json({ success: false, message: 'Horse not found' });
    }
    res.json({ success: true, data: horse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a horse listing + Mint NFT
// @route   POST /api/horses
const createHorse = async (req, res) => {
  try {
    const { name, breed, age, price, description, owner, imageUrl, ipfsHash, metadataUrl } = req.body;

    // 1. Mint NFT on blockchain
    const blockchainResult = await mintHorseNFT(
      name, breed, age, price, ipfsHash, metadataUrl || ipfsHash
    );

    // 2. Save to MongoDB
    const horse = await Horse.create({
      name,
      breed,
      age,
      price,
      description,
      owner,
      imageUrl,
      ipfsHash,
      tokenId: blockchainResult.tokenId,
      transactionHash: blockchainResult.transactionHash,
    });

    // 3. Record transaction
    await Transaction.create({
      type: 'list',
      horseId: horse._id,
      horseName: horse.name,
      horseImage: horse.imageUrl,
      from: owner.toLowerCase(),
      to: '',
      price: horse.price,
      transactionHash: blockchainResult.transactionHash,
      status: 'confirmed',
    });

    res.status(201).json({
      success: true,
      data: horse,
      blockchain: blockchainResult,
      nft: {
        tokenId: blockchainResult.tokenId,
        transactionHash: blockchainResult.transactionHash,
        message: '🐴 Horse NFT minted successfully!',
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update horse
// @route   PUT /api/horses/:id
const updateHorse = async (req, res) => {
  try {
    const horse = await Horse.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!horse) {
      return res.status(404).json({ success: false, message: 'Horse not found' });
    }
    if (req.body.price && horse.tokenId) {
      await updateHorsePriceOnBlockchain(horse.tokenId, req.body.price);
    }
    res.json({ success: true, data: horse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete horse listing
// @route   DELETE /api/horses/:id
const deleteHorse = async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);
    if (!horse) {
      return res.status(404).json({ success: false, message: 'Horse not found' });
    }
    if (horse.owner.toLowerCase() !== req.body.owner.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Horse.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Horse removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get horses by owner wallet
// @route   GET /api/horses/owner/:walletAddress
const getHorsesByOwner = async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress.toLowerCase();
    const horses = await Horse.find({
      owner: { $regex: new RegExp(`^${walletAddress}$`, 'i') }
    });
    res.json({ success: true, count: horses.length, data: horses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get horses for sale from blockchain
// @route   GET /api/horses/blockchain/forsale
const getBlockchainHorses = async (req, res) => {
  try {
    const horses = await getHorsesForSaleFromBlockchain();
    res.json({ success: true, count: horses.length, data: horses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Buy a horse - update owner in MongoDB
// @route   PUT /api/horses/:id/buy
const buyHorse = async (req, res) => {
  try {
    const { newOwner, transactionHash } = req.body;

    const horse = await Horse.findByIdAndUpdate(
      req.params.id,
      {
        owner: newOwner,
        isForSale: false,
        transactionHash: transactionHash,
      },
      { new: true }
    );

    if (!horse) {
      return res.status(404).json({ success: false, message: 'Horse not found' });
    }

    // Record transaction
    await Transaction.create({
      type: 'buy',
      horseId: horse._id,
      horseName: horse.name,
      horseImage: horse.imageUrl,
      from: horse.owner.toLowerCase(),
      to: newOwner.toLowerCase(),
      price: horse.price,
      transactionHash: transactionHash,
      status: 'confirmed',
    });

    res.json({ success: true, data: horse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllHorses,
  getHorseById,
  createHorse,
  updateHorse,
  deleteHorse,
  getHorsesByOwner,
  getBlockchainHorses,
  buyHorse,
};