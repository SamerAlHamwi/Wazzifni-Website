const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateLogin, validateRegistrationAuth, handleValidationErrors } = require('../middleware/validation');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

router.post('/register', validateRegistrationAuth, handleValidationErrors, authController.register);

// Log login attempts (especially for admin traceability)
router.post('/login', validateLogin, handleValidationErrors, auditLogger('Auth'), authController.login);

router.get('/me', protect, authController.getMe);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/update-password', protect, auditLogger('Auth'), authController.updatePassword);

module.exports = router;