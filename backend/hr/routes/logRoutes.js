const express = require('express');
const logController = require('../controllers/logController');
const { protect, can } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, can('adm'));
router.get('/', logController.getLogs);

module.exports = router;