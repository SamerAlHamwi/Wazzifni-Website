const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true,
        maxlength: [100, 'Course name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseUser',
        required: [true, 'Course must have an instructor']
    },
    instructorName: {
        type: String,
        required: [true, 'Instructor name is required']
    },
    instructorImage: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'other'
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'all'],
        default: 'beginner'
    },
    type: {
        type: String,
        enum: ['free', 'paid'],
        default: 'free'
    },
    price: {
        type: Number,
        required: function() {
            return this.type === 'paid';
        },
        min: [0, 'Price cannot be negative']
    },
    currency: {
        type: String,
        default: 'IQD'
    },
    totalSeats: {
        type: Number,
        required: [true, 'Total seats are required'],
        min: [1, 'Total seats must be at least 1']
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'completed'],
        default: 'active'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date
    },
    schedule: [{
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        startTime: String,
        endTime: String
    }],
    duration: {
        value: Number,
        unit: {
            type: String,
            enum: ['hours', 'days', 'weeks', 'months']
        }
    },
    prerequisites: [{
        type: String
    }],
    learningOutcomes: [{
        type: String
    }],
    syllabus: [{
        week: Number,
        title: String,
        description: String,
        topics: [String]
    }],
    materials: [{
        title: String,
        type: {
            type: String,
            enum: ['video', 'pdf', 'link', 'file']
        },
        url: String
    }],
    coverImage: {
        type: String,
        default: ''
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    language: {
        type: String,
        default: 'ar'
    },
    certificateAvailable: {
        type: Boolean,
        default: true
    },
    requirements: [{
        type: String
    }],
    targetAudience: [{
        type: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate for registrations
courseSchema.virtual('registrations', {
    ref: 'Registration',
    localField: '_id',
    foreignField: 'course',
    count: true
});

// Create slug from name
courseSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        // Updated regex to support Arabic and other Unicode characters
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\p{L}\p{N}]+/gu, '-') // Matches anything that is NOT a letter or number
            .replace(/^-+|-+$/g, '');         // Removes leading/trailing hyphens

        // Fallback if the name results in an empty slug
        if (!this.slug) {
            this.slug = `course-${Date.now()}`;
        }
    }
    next();
});

// Indexes for better query performance
courseSchema.index({ slug: 1 });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ isPublished: 1, startDate: 1 });

module.exports = mongoose.model('Course', courseSchema);