const express = require('express');
const inquiryController = require('../controllers/inquiryController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateInquiry, handleValidationErrors } = require('../middleware/validation');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

// Public route — the landing-page contact forms post here.
router.post('/', validateInquiry, handleValidationErrors, inquiryController.createInquiry);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin', 'instructor'));
router.use(auditLogger('Inquiry'));

// Static paths first so '/stats' and '/export' are not read as an :id.
router.get('/stats', inquiryController.getInquiryStats);
router.get('/export', inquiryController.exportInquiries);
router.get('/', inquiryController.getAllInquiries);
router.patch('/:id/status', inquiryController.updateInquiryStatus);
router.delete('/:id', inquiryController.deleteInquiry);

module.exports = router;
