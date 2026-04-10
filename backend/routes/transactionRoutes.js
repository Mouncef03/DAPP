const express = require('express');
const router = express.Router();
const { getTransactionsByWallet, createTransaction } = require('../controllers/transactionController');

router.route('/').post(createTransaction);
router.route('/:walletAddress').get(getTransactionsByWallet);

module.exports = router;