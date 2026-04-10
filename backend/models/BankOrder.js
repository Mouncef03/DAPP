const mongoose = require('mongoose');

const bankOrderSchema = new mongoose.Schema(
  {
    horseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
      required: true,
    },
    horseName: { type: String, required: true },
    horseImage: { type: String, default: '' },
    horsePrice: { type: Number, required: true },
    priceInMAD: { type: Number, required: true },

    // Buyer Info
    buyerWallet: { type: String, required: true },
    buyerName: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerBank: { type: String, required: true },
    buyerRIB: { type: String, required: true },

    // Seller Info
    sellerWallet: { type: String, required: true },

    // Order Status
    status: {
      type: String,
      enum: ['pending', 'payment_sent', 'confirmed', 'cancelled'],
      default: 'pending',
    },

    // Payment Proof
    paymentProof: { type: String, default: '' },
    paymentProofUrl: { type: String, default: '' },

    notes: { type: String, default: '' },
    confirmedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BankOrder', bankOrderSchema);