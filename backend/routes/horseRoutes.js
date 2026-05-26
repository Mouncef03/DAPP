const express = require('express');
const Horse = require('../models/Horse');
const router = express.Router();
const {
  getAllHorses,
  getHorseById,
  createHorse,
  updateHorse,
  deleteHorse,
  getHorsesByOwner,
  getBlockchainHorses,
  buyHorse,
} = require('../controllers/horseController');

router.route('/').get(getAllHorses).post(createHorse);
router.route('/blockchain/forsale').get(getBlockchainHorses);
router.route('/owner/:walletAddress').get(getHorsesByOwner);
router.route('/:id').get(getHorseById).put(updateHorse).delete(deleteHorse);
router.route('/:id/buy').put(buyHorse);


router.route('/:id/toggle-sale').put(async (req, res) => {
  try {
    console.log('🔍 Toggle sale request received');
    console.log('🔍 Horse ID:', req.params.id);
    console.log('🔍 Owner:', req.body.owner);
    console.log('🔍 Price:', req.body.price);

    const horse = await Horse.findById(req.params.id);
    if (!horse) return res.status(404).json({ success: false, message: 'Horse not found' });
    if (horse.owner.toLowerCase() !== req.body.owner.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    horse.isForSale = !horse.isForSale;
    horse.price = req.body.price || horse.price;
    await horse.save();

    try {
      const { ethers } = require('ethers');
      const HorseNFTABI = require('../config/abi/HorseMarketplace.json');
      const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, HorseNFTABI.abi, wallet);
      const tx = await contract.toggleSaleStatus(parseInt(horse.tokenId));
      await tx.wait();
      console.log('✅ Sale status toggled on blockchain');
    } catch (blockchainError) {
      console.error('⚠️ Blockchain toggle failed:', blockchainError.message);
    }

    res.json({ success: true, data: horse });
  } catch (error) {
    console.error('❌ Toggle sale error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;