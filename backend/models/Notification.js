const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true },
    type: {
      type: String,
      enum: ['payment_sent', 'order_confirmed', 'order_cancelled'],
      required: true,
    },
    message: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankOrder' },
    horseName: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);