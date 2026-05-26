const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');

router.route('/dashboard').get(getDashboardStats);

module.exports = router;