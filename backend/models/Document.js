const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    horseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['certificate', 'pedigree', 'health', 'insurance', 'other'],
      default: 'other',
    },
    ipfsHash: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: String, required: true },

    // Cryptographic signature fields
    signature: { type: String, default: '' },
    messageHash: { type: String, default: '' },
    signerAddress: { type: String, default: '' },
    isSigned: { type: Boolean, default: false },
    signedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);