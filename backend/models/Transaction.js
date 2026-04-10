const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['buy', 'sell', 'list'],
      required: true,
    },
    horseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
      required: true,
    },
    horseName: { type: String, required: true },
    horseImage: { type: String, default: '' },
    from: { type: String, required: true },
    to: { type: String, default: '' },
    price: { type: Number, required: true },
    transactionHash: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);