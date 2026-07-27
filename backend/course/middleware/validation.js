const { validationResult, body } = require('express-validator');
const AppError = require('../utils/AppError');

// Generic validation error handler
exports.handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join('. ');
        return next(new AppError(errorMessages, 400));
    }
    next();
};

// Course creation validation
exports.validateCourse = [
    body('name').notEmpty().withMessage('Course name is required'),
    body('description').notEmpty().withMessage('Course description is required'),
    body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
    body('startDate').isISO8601().toDate().withMessage('Start date must be a valid date')
];

// Registration validation
exports.validateRegistration = [
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('studentName').notEmpty().withMessage('Student name is required'),
    body('studentPhone').matches(/^[0-9]{10,15}$/).withMessage('Valid phone number is required'),
    body('governorate').notEmpty().withMessage('Governorate is required'),
    body('educationLevel').notEmpty().withMessage('Education level is required'),
    body('currentJob').notEmpty().withMessage('Current job is required')
];

// Auth validation
exports.validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

exports.validateRegistrationAuth = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').matches(/^[0-9]{10,15}$/).withMessage('Valid phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];