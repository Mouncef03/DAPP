const express = require('express');
const router = express.Router();
const {
  startAuction,
  placeBid,
  acceptBid,
  cancelAuction,
  getAuctionByHorse,
  getAllAuctions,
  getAuctionsBySeller,
} = require('../controllers/auctionController');

const Auction = require('../models/Auction');
const { saveAuction } = require('../controllers/auctionController');

router.route('/').get(getAllAuctions).post(startAuction);
router.route('/horse/:horseId').get(getAuctionByHorse);
router.route('/seller/:walletAddress').get(getAuctionsBySeller);
router.route('/:id').get(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
    res.json({ success: true, data: auction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.route('/save').post(saveAuction);
router.route('/:id/bid').post(placeBid);
router.route('/:id/accept').put(acceptBid);
router.route('/:id/cancel').put(cancelAuction);

module.exports = router;