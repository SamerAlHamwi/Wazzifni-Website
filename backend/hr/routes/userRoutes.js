const express = require('express');
const userController = require('../controllers/userController');
const { protect, can } = require('../middleware/authMiddleware');
const { validate, userValidation } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(can('adm'), userController.getAllUsers)
  .post(can('adm'), validate(userValidation), userController.createUser);

router
  .route('/:id')
  .get(can('adm'), userController.getUser)
  .patch(can('adm'), userController.updateUser)
  .delete(can('adm'), userController.deleteUser);

router.patch('/:id/toggle', can('adm'), userController.toggleActive);
router.post('/change-password', userController.changePassword);

module.exports = router;