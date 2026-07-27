const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

const router = express.Router();

// Protected routes (Logged-in users)
router.use(protect);

router.get('/me', userController.getUser);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

// Admin-only routes
router.use(restrictTo('admin'));

// Log sensitive user management actions
router.use(auditLogger('User'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;