const express = require('express');
const reportController = require('../controllers/reportController');
const { protect, can } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, can('rep'));
router.get('/', reportController.getReports);

module.exports = router;