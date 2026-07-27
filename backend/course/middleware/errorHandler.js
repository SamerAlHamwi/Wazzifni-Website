const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production mode
        let error = { ...err };
        error.message = err.message;

        // Cast error (invalid id)
        if (err.name === 'CastError') {
            error = new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
        }

        // Duplicate key error
        if (err.code === 11000) {
            let value = 'Duplicate value';
            if (err.keyValue) {
                value = Object.values(err.keyValue)[0];
            } else if (err.errmsg) {
                const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
                if (match) value = match[0];
            }

            error = new AppError(
                `Duplicate field value: ${value}. Please use another value!`,
                400
            );
        }

        // Validation error
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            error = new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
        }

        // JWT error
        if (err.name === 'JsonWebTokenError') {
            error = new AppError('Invalid token. Please log in again!', 401);
        }

        // JWT expired error
        if (err.name === 'TokenExpiredError') {
            error = new AppError('Your token has expired! Please log in again.', 401);
        }

        res.status(error.statusCode).json({
            status: error.status,
            message: error.message || 'Something went wrong!'
        });
    }
};