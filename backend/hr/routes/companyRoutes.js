const express = require('express');
const companyController = require('../controllers/companyController');
const { protect, can } = require('../middleware/authMiddleware');
const { validate, body } = require('express-validator'); // optional validation

const router = express.Router();

// All company routes require authentication
router.use(protect);

router
  .route('/')
  .get(companyController.getAllCompanies)
  .post(can('add'), companyController.createCompany);

router
  .route('/:id')
  .get(companyController.getCompany)
  .patch(can('edit'), companyController.updateCompany)
  .delete(can('del'), companyController.deleteCompany);

module.exports = router;