const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => err.msg);
    return next(new AppError(extractedErrors.join(', '), 400));
  };
};

// Auth validations
const loginValidation = [
  body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
];

const userValidation = [
  body('name').notEmpty().withMessage('الاسم مطلوب'),
  body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
  body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
];

// Applicant validations
const applicantValidation = [
  body('name').notEmpty().withMessage('اسم المتقدم مطلوب'),
];

module.exports = {
  validate,
  loginValidation,
  userValidation,
  applicantValidation,
};