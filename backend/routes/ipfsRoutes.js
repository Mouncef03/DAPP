const express = require('express');
const router = express.Router();
const {
  upload,
  uploadToIPFS,
  uploadMetadataToIPFS,
} = require('../controllers/ipfsController');

// Upload image to IPFS
router.post('/upload', upload.single('image'), uploadToIPFS);

// Upload metadata to IPFS
router.post('/metadata', uploadMetadataToIPFS);

module.exports = router;