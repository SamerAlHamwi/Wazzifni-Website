const express = require('express');
const registrationController = require('../controllers/registrationController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateRegistration, handleValidationErrors } = require('../middleware/validation');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

// Public routes for registrations
router.get('/', registrationController.getAllRegistrations);
router.post('/', validateRegistration, handleValidationErrors, registrationController.createRegistration);
router.post('/register', validateRegistration, handleValidationErrors, registrationController.createRegistration);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin', 'instructor'));

// Apply audit logging to registration management
router.use(auditLogger('Registration'));

router.patch('/:id/status', registrationController.updateRegistrationStatus);
router.delete('/:id', registrationController.deleteRegistration);
router.get('/stats', registrationController.getRegistrationStats);
router.get('/export', registrationController.exportRegistrations);

module.exports = router;