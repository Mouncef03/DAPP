const pinataSDK = require('@pinata/sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// ─── Init Pinata ──────────────────────────────────────────────
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

// ─── Multer Config (temporary local storage) ──────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(file.mimetype);
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// ─── Upload Image to IPFS ─────────────────────────────────────
// @route POST /api/ipfs/upload
const uploadToIPFS = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Read file and upload to Pinata
    const readableStream = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: { name: fileName },
      pinataOptions: { cidVersion: 0 },
    };

    const result = await pinata.pinFileToIPFS(readableStream, options);

    // Delete temp file after upload
    fs.unlinkSync(filePath);

    const ipfsHash = result.IpfsHash;
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    res.json({
      success: true,
      ipfsHash,
      imageUrl,
      message: 'Image uploaded to IPFS successfully!',
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Upload Metadata to IPFS ──────────────────────────────────
// @route POST /api/ipfs/metadata
const uploadMetadataToIPFS = async (req, res) => {
  try {
    const { name, breed, age, price, description, imageUrl } = req.body;

    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes: [
        { trait_type: 'Breed', value: breed },
        { trait_type: 'Age', value: age },
        { trait_type: 'Price', value: price },
      ],
    };

    const options = {
      pinataMetadata: { name: `${name}_metadata` },
      pinataOptions: { cidVersion: 0 },
    };

    const result = await pinata.pinJSONToIPFS(metadata, options);
    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

    res.json({
      success: true,
      ipfsHash: result.IpfsHash,
      metadataUrl,
      message: 'Metadata uploaded to IPFS successfully!',
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { upload, uploadToIPFS, uploadMetadataToIPFS };