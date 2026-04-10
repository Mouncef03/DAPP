const express = require('express');
const router = express.Router();
const {
  uploadDoc,
  uploadDocument,
  getDocumentsByHorse,
  deleteDocument,
  signDocument,
  verifyDocument,
} = require('../controllers/documentController');

router.route('/:horseId').get(getDocumentsByHorse).post(uploadDoc.single('document'), uploadDocument);
router.route('/delete/:id').delete(deleteDocument);
router.route('/:id/sign').put(signDocument);
router.route('/:id/verify').get(verifyDocument);
router.route('/single/:id').get(async (req, res) => {
  try {
    const Document = require('../models/Document');
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;