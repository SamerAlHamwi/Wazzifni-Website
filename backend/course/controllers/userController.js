const User = require('../models/CourseUser');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Get all users (admin only)
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const { role, isActive, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive) query.isActive = isActive === 'true';
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }

    const users = await User.find(query).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

// Get single user
exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
        .populate('coursesTaught', 'name startDate isPublished')
        .populate('registrations', 'courseName status paymentStatus');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// Update user (admin only)
exports.updateUser = catchAsync(async (req, res, next) => {
    const { name, email, phone, role, isActive, expertise, bio } = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, phone, role, isActive, expertise, bio },
        {
            new: true,
            runValidators: true
        }
    );

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// Delete user (admin only)
exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Check if user has active registrations or courses
    if (user.role === 'instructor') {
        const Course = require('../models/Course');
        const count = await Course.countDocuments({ instructor: user.id });
        if (count > 0) {
            return next(new AppError('Cannot delete instructor with active courses', 400));
        }
    }

    await user.deleteOne();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Update me
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /update-password.',
                400
            )
        );
    }

    // 2) Filter out unwanted fields names that are not allowed to be updated
    const filteredBody = {};
    const allowedFields = ['name', 'email', 'phone', 'bio', 'expertise', 'avatar'];
    Object.keys(req.body).forEach(el => {
        if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Delete me (deactivate)
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});