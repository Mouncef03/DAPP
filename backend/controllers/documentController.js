const Document = require('../models/Document');
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

// Multer config for documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadDoc = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const isValid = allowed.test(file.mimetype);
    isValid ? cb(null, true) : cb(new Error('Invalid file type'));
  },
});

// @desc Upload document to IPFS and save to MongoDB
// @route POST /api/documents/:horseId
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { name, type, uploadedBy } = req.body;
    const filePath = req.file.path;

    const readableStream = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: { name: req.file.originalname },
      pinataOptions: { cidVersion: 0 },
    };

    const result = await pinata.pinFileToIPFS(readableStream, options);
    fs.unlinkSync(filePath);

    const ipfsHash = result.IpfsHash;
    const fileUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    const document = await Document.create({
      horseId: req.params.horseId,
      name,
      type,
      ipfsHash,
      fileUrl,
      uploadedBy,
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all documents for a horse
// @route GET /api/documents/:horseId
const getDocumentsByHorse = async (req, res) => {
  try {
    const documents = await Document.find({ horseId: req.params.horseId });
    res.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete a document
// @route DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sign document with wallet signature
// @route   PUT /api/documents/:id/sign
const signDocument = async (req, res) => {
  try {
    const { signature, messageHash, signerAddress } = req.body;

    if (!signature || !messageHash || !signerAddress) {
      return res.status(400).json({
        success: false,
        message: 'Signature, messageHash and signerAddress are required',
      });
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        signature,
        messageHash,
        signerAddress: signerAddress.toLowerCase(),
        isSigned: true,
        signedAt: new Date(),
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({
      success: true,
      data: document,
      message: 'Document signed successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify document signature
// @route   GET /api/documents/:id/verify
const verifyDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!document.isSigned) {
      return res.json({
        success: true,
        isValid: false,
        message: 'Document has not been signed',
      });
    }

    const { ethers } = require('ethers');

    // Recover the signer address from signature
    const recoveredAddress = ethers.verifyMessage(
      document.messageHash,
      document.signature
    );

    const isValid = recoveredAddress.toLowerCase() === document.signerAddress.toLowerCase();

    res.json({
      success: true,
      isValid,
      recoveredAddress,
      signerAddress: document.signerAddress,
      signedAt: document.signedAt,
      message: isValid
        ? '✅ Signature is valid! Document is authentic.'
        : '❌ Signature is invalid! Document may have been tampered.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadDoc,
  uploadDocument,
  getDocumentsByHorse,
  deleteDocument,
  signDocument,
  verifyDocument,
};