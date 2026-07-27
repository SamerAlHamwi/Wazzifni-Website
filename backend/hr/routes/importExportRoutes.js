const express = require('express');
const importExportController = require('../controllers/importExportController');
const { protect, can } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, can('adm'));
router.get('/export', importExportController.exportData);
router.post('/import', importExportController.importData);

module.exports = router;