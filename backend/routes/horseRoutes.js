const express = require('express');
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

module.exports = router;