const jwt = require('jsonwebtoken');
const User = require('../models/CourseUser');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Advanced Authentication Middleware (Bearer Token)
 * Validates JWT, checks user existence, verifies password hasn't changed, and account status.
 */
exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // 1) Extract Bearer token from header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('غير مصرح لك بالوصول. يرجى تسجيل الدخول أولاً', 401)
        );
    }

    // 2) Verify token integrity
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى', 401));
        }
        return next(new AppError('رمز الأمان غير صالح', 401));
    }

    // 3) Check if user still exists in database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'المستخدم صاحب هذا الرمز لم يعد موجوداً',
                401
            )
        );
    }

    // 4) Check if user account is still active
    if (!currentUser.isActive) {
        return next(new AppError('هذا الحساب تم تعطيله. يرجى التواصل مع الإدارة', 403));
    }

    // 5) Check if password was changed after JWT was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('تم تغيير كلمة المرور مؤخراً. يرجى إعادة تسجيل الدخول', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

/**
 * Role-Based Access Control (RBAC) Middleware
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user was set by protect middleware
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('ليس لديك صلاحية للقيام بهذا الإجراء', 403)
            );
        }

        next();
    };
};