const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, loginValidation } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/login', validate(loginValidation), authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;