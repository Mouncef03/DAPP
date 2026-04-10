const express = require('express');
const router = express.Router();
const {
  uploadProof,
  createBankOrder,
  uploadPaymentProof,
  confirmBankOrder,
  cancelBankOrder,
  getOrdersByBuyer,
  getOrdersBySeller,
  getOrderById,
} = require('../controllers/bankOrderController');

router.route('/').post(createBankOrder);
router.route('/buyer/:walletAddress').get(getOrdersByBuyer);
router.route('/seller/:walletAddress').get(getOrdersBySeller);
router.route('/:id').get(getOrderById);
router.route('/:id/proof').put(uploadProof.single('proof'), uploadPaymentProof);
router.route('/:id/confirm').put(confirmBankOrder);
router.route('/:id/cancel').put(cancelBankOrder);

module.exports = router;