const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, can } = require('../middleware/authMiddleware');
const { validate, body } = require('express-validator'); // optional validation

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Summary route (must come before /:id to avoid conflict)
router.get('/summary', paymentController.getPaymentsSummary);

router
  .route('/')
  .get(paymentController.getAllPayments)
  .post(can('add'), paymentController.createPayment);

router
  .route('/:id')
  .get(paymentController.getPayment)
  .patch(can('edit'), paymentController.updatePayment)
  .delete(can('del'), paymentController.deletePayment);

module.exports = router;