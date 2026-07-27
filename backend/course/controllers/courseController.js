const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/CourseUser'); // Renamed from User
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { uploadFile, deleteFile } = require('../services/fileService');

// Helper to map frontend fields to backend model fields
const mapCourseFields = (body) => {
    const mapped = { ...body };
    if (body.desc) mapped.description = body.desc;
    if (body.seats) mapped.totalSeats = body.seats;
    if (body.teacherName) mapped.instructorName = body.teacherName;
    if (body.teacherImg) mapped.instructorImage = body.teacherImg;
    return mapped;
};

// Get all courses
exports.getAllCourses = catchAsync(async (req, res, next) => {
    const {
        page = 1,
        limit = 10,
        category,
        level,
        type,
        search,
        sort = '-createdAt',
        instructor,
        status
    } = req.query;

    const query = { isPublished: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (type) query.type = type;
    if (instructor) query.instructor = instructor;
    if (status) query.status = status;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { instructorName: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
        .populate('instructor', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
            courses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// Get single course
exports.getCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findOne({
        slug: req.params.slug,
        isPublished: true
    }).populate('instructor', 'name email avatar bio expertise');

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Increment views
    course.views += 1;
    await course.save({ validateBeforeSave: false });

    // Get registrations count
    const registrationsCount = await mongoose.model('Registration')
        .countDocuments({ course: course._id, status: 'confirmed' });

    res.status(200).json({
        status: 'success',
        data: {
            course,
            registrationsCount
        }
    });
});

// Create course (admin/instructor only)
exports.createCourse = catchAsync(async (req, res, next) => {
    const data = mapCourseFields(req.body);

    // If no instructor provided, use current user
    if (!data.instructor) {
        data.instructor = req.user.id;
    }
    if (!data.instructorName) {
        data.instructorName = req.user.name;
    }

    const course = await Course.create(data);

    res.status(201).json({
        status: 'success',
        data: {
            course
        }
    });
});

// Update course
exports.updateCourse = catchAsync(async (req, res, next) => {
    const data = mapCourseFields(req.body);
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Check permissions
    if (req.user.role !== 'admin' &&
        course.instructor.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to update this course', 403));
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            course: updatedCourse
        }
    });
});

// Delete course
exports.deleteCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Check permissions
    if (req.user.role !== 'admin' &&
        course.instructor.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to delete this course', 403));
    }

    // Check if there are active registrations
    const Registration = mongoose.model('Registration');
    const activeRegistrations = await Registration.countDocuments({
        course: course._id,
        status: { $in: ['pending', 'confirmed'] }
    });

    if (activeRegistrations > 0) {
        return next(new AppError('Cannot delete course with active registrations', 400));
    }

    // Delete course cover image
    if (course.coverImage) {
        await deleteFile(course.coverImage);
    }

    // In Mongoose 7+, remove() is deprecated, use deleteOne()
    await course.deleteOne();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Upload course cover image
exports.uploadCoverImage = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload an image', 400));
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Delete old image if exists
    if (course.coverImage) {
        await deleteFile(course.coverImage);
    }

    const imageUrl = await uploadFile(req.file, 'courses');

    course.coverImage = imageUrl;
    await course.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            coverImage: imageUrl
        }
    });
});

// Get courses by instructor
exports.getInstructorCourses = catchAsync(async (req, res, next) => {
    const instructorId = req.params.instructorId || req.user.id;

    const courses = await Course.find({ instructor: instructorId })
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
            courses
        }
    });
});

// Get featured courses
exports.getFeaturedCourses = catchAsync(async (req, res, next) => {
    const courses = await Course.find({ isFeatured: true, isPublished: true })
        .limit(parseInt(req.query.limit) || 6);

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
            courses
        }
    });
});

// Toggle course publish status (admin/instructor only)
exports.togglePublish = catchAsync(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
        status: 'success',
        data: {
            isPublished: course.isPublished
        }
    });
});

// Mark course as completed
exports.markAsCompleted = catchAsync(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Check permissions
    if (req.user.role !== 'admin' &&
        course.instructor.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to update this course', 403));
    }

    course.status = 'completed';
    await course.save();

    res.status(200).json({
        status: 'success',
        data: {
            course
        }
    });
});

// Get course stats (admin only)
exports.getCourseStats = catchAsync(async (req, res, next) => {
    const stats = await Course.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                avgPrice: { $avg: '$price' },
                totalSeats: { $sum: '$totalSeats' },
                avgRating: { $avg: '$rating' }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const featuredCourses = await Course.countDocuments({ isFeatured: true });

    res.status(200).json({
        status: 'success',
        data: {
            stats,
            totals: {
                total: totalCourses,
                published: publishedCourses,
                featured: featuredCourses
            }
        }
    });
});