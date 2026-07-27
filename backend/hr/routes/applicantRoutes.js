const express = require('express');
const applicantController = require('../controllers/applicantController');
const { protect, can } = require('../middleware/authMiddleware');
const { validate, applicantValidation } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect); // all routes require authentication

router
  .route('/')
  .get(applicantController.getAllApplicants)
  .post(can('add'), validate(applicantValidation), applicantController.createApplicant);

router
  .route('/:id')
  .get(applicantController.getApplicant)
  .patch(can('edit'), applicantController.updateApplicant)
  .delete(can('del'), applicantController.deleteApplicant);

module.exports = router;