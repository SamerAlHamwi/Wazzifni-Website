const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseUser',
        required: false // Optional for guests
    },
    studentName: {
        type: String,
        required: [true, 'Student name is required']
    },
    studentPhone: {
        type: String,
        required: [true, 'Student phone is required']
    },
    studentEmail: {
        type: String,
        required: false // Optional for guests
    },
    gender: {
        type: String,
        required: false,
        enum: ['male', 'female', 'ذكر', 'أنثى']
    },
    governorate: {
        type: String,
        required: false, // Made optional for schema flexibility
        enum: [
            'Najaf', 'Baghdad', 'Basra', 'Nineveh', 'Erbil',
            'Sulaymaniyah', 'Duhok', 'Kirkuk', 'Anbar', 'Babil',
            'Karbala', 'Qadisiyah', 'Wasit', 'Salah Al-Din',
            'Diyala', 'Maysan', 'Muthanna', 'Dhi Qar',
            // Arabic names
            'النجف', 'بغداد', 'البصرة', 'نينوى', 'أربيل',
            'السليمانية', 'دهوك', 'كركوك', 'الأنبار', 'بابل',
            'كربلاء', 'القادسية', 'واسط', 'صلاح الدين',
            'ديالى', 'ميسان', 'المثنى', 'ذي قار'
        ]
    },
    educationLevel: {
        type: String,
        required: false, // Made optional for schema flexibility
        enum: [
            'No Formal Education', 'Primary School', 'Middle School',
            'High School', 'Diploma', 'Bachelor’s Degree',
            'Master’s Degree', 'PhD',
            // Arabic names
            'بدون شهادة', 'ابتدائي', 'متوسط', 'إعدادي', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'
        ]
    },
    studyDescription: {
        type: String,
        required: false
    },
    currentJob: {
        type: String,
        required: false, // Made optional for schema flexibility
        enum: [
            'Student', 'Employee', 'Unemployed',
            // Arabic names
            'طالب', 'موظف', 'عاطل'
        ]
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course is required']
    },
    courseName: {
        type: String,
        required: [true, 'Course name is required']
    },
    courseType: {
        type: String,
        enum: ['free', 'paid'],
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'Accepted', 'Rejected'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: function() {
            return this.courseType === 'free' ? 'paid' : 'pending';
        }
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'none'],
        default: 'none'
    },
    paymentDate: Date,
    paymentReference: String,
    attended: {
        type: Boolean,
        default: false
    },
    certificateIssued: {
        type: Boolean,
        default: false
    },
    certificateUrl: String,
    notes: String,
    registeredAt: {
        type: Date,
        default: Date.now
    },
    cancelledAt: Date,
    cancellationReason: String
}, {
    timestamps: true
});

// Ensure unique registration per student per course
// Only enforce uniqueness if student exists
registrationSchema.index({ student: 1, course: 1 }, {
    unique: true,
    partialFilterExpression: { student: { $exists: true, $ne: null } }
});

// Also unique per phone per course to prevent duplicate guest registrations
registrationSchema.index({ studentPhone: 1, course: 1 }, { unique: true });

// Static method to get registrations by date range
registrationSchema.statics.getByDateRange = function(startDate, endDate) {
    return this.find({
        registeredAt: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate('student', 'name email phone')
      .populate('course', 'name instructorName');
};

// Static method to get stats
registrationSchema.statics.getStats = async function(courseId = null) {
    const match = courseId ? { course: new mongoose.Types.ObjectId(courseId) } : {};

    const stats = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                confirmed: {
                    $sum: { $cond: [{ $in: ['$status', ['confirmed', 'Accepted']] }, 1, 0] }
                },
                pending: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                cancelled: {
                    $sum: { $cond: [{ $in: ['$status', ['cancelled', 'Rejected']] }, 1, 0] }
                },
                paid: {
                    $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || { total: 0, confirmed: 0, pending: 0, cancelled: 0, paid: 0 };
};

module.exports = mongoose.model('Registration', registrationSchema);