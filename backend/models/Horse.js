const mongoose = require('mongoose');

const horseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Horse name is required'],
      trim: true,
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    imageUrl: {
      type: String,   // IPFS link will be stored here
      default: '',
    },
    ipfsHash: {
      type: String,   // Pinata IPFS hash
      default: '',
    },
    owner: {
      type: String,   // Wallet address of the owner
      required: [true, 'Owner wallet address is required'],
    },
    tokenId: {
      type: Number,   // Blockchain token ID
      default: null,
    },
    isForSale: {
      type: Boolean,
      default: true,
    },
    transactionHash: {
      type: String,   // Blockchain transaction hash
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Horse', horseSchema);