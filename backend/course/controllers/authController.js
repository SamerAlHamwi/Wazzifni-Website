const User = require('../models/CourseUser');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');

// Register user
exports.register = catchAsync(async (req, res, next) => {
    const { name, email, phone, password, role } = req.body;

    // Security: Only students can register through this endpoint normally.
    // If someone tries to register as admin/instructor, force it back to student unless it's a seed.
    const userRole = (role === 'admin' || role === 'instructor') ? 'student' : (role || 'student');

    const user = await User.create({
        name,
        email,
        phone,
        password,
        role: userRole
    });

    const token = user.generateAuthToken();

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('يرجى إدخال البريد الإلكتروني وكلمة المرور', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401));
    }

    // 3) Security: Check if user is active
    if (!user.isActive) {
        return next(new AppError('هذا الحساب معطل. يرجى مراجعة الإدارة', 403));
    }

    // 4) Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // 5) Generate secure JWT
    const token = user.generateAuthToken();

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    });
});

// Get current user
exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// Forgot password (Security note: in production use a real email service)
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        // For security, don't reveal if email exists, but here we provide feedback for UX
        return next(new AppError('لم يتم العثور على مستخدم بهذا البريد الإلكتروني', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Respond (Note: Should send email instead of returning token)
    res.status(200).json({
        status: 'success',
        message: 'تم إرسال رمز استعادة كلمة المرور',
        resetToken // TODO: REMOVE THIS IN PRODUCTION
    });
});

// Reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('الرمز غير صالح أو انتهت صلاحيته', 400));
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Log the user in, send JWT
    const token = user.generateAuthToken();

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
});

// Update password
exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.comparePassword(req.body.passwordCurrent))) {
        return next(new AppError('كلمة المرور الحالية غير صحيحة', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    await user.save();

    // 4) Log user in, send JWT
    const token = user.generateAuthToken();

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
});