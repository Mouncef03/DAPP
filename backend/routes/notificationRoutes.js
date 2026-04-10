const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.route('/:walletAddress').get(getNotifications);
router.route('/:walletAddress/read-all').put(markAllAsRead);
router.route('/:id/read').put(markAsRead);

module.exports = router;