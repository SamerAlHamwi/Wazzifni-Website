const express = require('express');
const smsController = require('../controllers/smsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send', protect, smsController.sendSMS);

module.exports = router;
