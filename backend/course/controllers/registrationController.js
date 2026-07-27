const Registration = require('../models/Registration');
const Course = require('../models/Course');
const User = require('../models/CourseUser');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Create registration
exports.createRegistration = catchAsync(async (req, res, next) => {
    const {
        courseId,
        studentName,
        studentPhone,
        studentEmail,
        gender,
        governorate,
        educationLevel,
        studyDescription,
        currentJob
    } = req.body;

    // 1) Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // 2) Check if course is completed
    if (course.status === 'completed') {
        return next(new AppError('Course is already completed', 400));
    }

    // 3) Create registration
    const registration = await Registration.create({
        student: req.user ? req.user.id : null,
        studentName,
        studentPhone,
        studentEmail,
        gender,
        governorate,
        educationLevel,
        studyDescription,
        currentJob,
        course: courseId,
        courseName: course.name,
        courseType: course.type,
        price: course.price || 0,
        status: 'pending' // Initial status always pending now if managed by admin
    });

    // 4) Return response
    res.status(201).json({
        status: 'success',
        data: {
            registration
        }
    });
});

// Get all registrations (admin only)
exports.getAllRegistrations = catchAsync(async (req, res, next) => {
    const { course, status, student, gender, type, search } = req.query;
    const query = {};

    if (course) query.course = course;
    if (status) query.status = status;
    if (student) query.student = student;
    if (gender) {
        if (gender === 'male') query.gender = { $in: ['male', 'ذكر'] };
        else if (gender === 'female') query.gender = { $in: ['female', 'أنثى'] };
        else query.gender = gender;
    }
    if (type) query.courseType = type;

    if (search) {
        query.$or = [
            { studentName: { $regex: search, $options: 'i' } },
            { studentPhone: { $regex: search, $options: 'i' } },
            { studentEmail: { $regex: search, $options: 'i' } }
        ];
    }

    const registrations = await Registration.find(query)
        .populate('course', 'name instructorName startDate type price')
        .populate('student', 'name email phone')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: registrations.length,
        data: {
            registrations
        }
    });
});

// Update registration status
exports.updateRegistrationStatus = catchAsync(async (req, res, next) => {
    const { status, paymentStatus, paymentMethod, paymentReference, notes } = req.body;

    const registration = await Registration.findById(req.params.id);

    if (!registration) {
        return next(new AppError('Registration not found', 404));
    }

    // Update fields
    if (status) registration.status = status;
    if (paymentStatus) {
        registration.paymentStatus = paymentStatus;
        if (paymentStatus === 'paid') {
            registration.paymentDate = Date.now();
        }
    }
    if (paymentMethod) registration.paymentMethod = paymentMethod;
    if (paymentReference) registration.paymentReference = paymentReference;
    if (notes) registration.notes = notes;

    await registration.save();

    res.status(200).json({
        status: 'success',
        data: {
            registration
        }
    });
});

// Delete registration
exports.deleteRegistration = catchAsync(async (req, res, next) => {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
        return next(new AppError('Registration not found', 404));
    }

    await registration.deleteOne();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Get registration stats
exports.getRegistrationStats = catchAsync(async (req, res, next) => {
    const stats = await Registration.getStats(req.query.courseId);

    // Get daily registration growth
    const days = parseInt(req.query.days) || 30;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const dailyGrowth = await Registration.aggregate([
        {
            $match: {
                createdAt: { $gte: dateLimit }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats,
            daily: dailyGrowth
        }
    });
});

// Export registrations to CSV
exports.exportRegistrations = catchAsync(async (req, res, next) => {
    const registrations = await Registration.find()
        .populate('course', 'name instructorName')
        .sort('-createdAt');

    // Basic CSV generation
    let csv = 'Student Name,Phone,Email,Gender,Governorate,Education,Study,Job,Course,Type,Status,Payment,Registered At\n';

    registrations.forEach(r => {
        csv += `${r.studentName},${r.studentPhone},${r.studentEmail || ''},${r.gender},${r.governorate},${r.educationLevel},${r.studyDescription || ''},${r.currentJob},${r.courseName},${r.courseType},${r.status},${r.paymentStatus},${r.registeredAt.toISOString()}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('registrations.csv');
    res.send(csv);
});