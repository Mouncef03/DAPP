const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  bidder: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionHash: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const auctionSchema = new mongoose.Schema(
  {
    horseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
      required: true,
    },
    horseName: { type: String, required: true },
    horseImage: { type: String, default: '' },
    tokenId: { type: Number, required: true },
    seller: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    highestBid: { type: Number, default: 0 },
    highestBidder: { type: String, default: '' },
    durationInHours: { type: Number, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'ended', 'cancelled'],
      default: 'active',
    },
    bids: [bidSchema],
    winner: { type: String, default: '' },
    finalPrice: { type: Number, default: 0 },
    transactionHash: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Auction', auctionSchema);