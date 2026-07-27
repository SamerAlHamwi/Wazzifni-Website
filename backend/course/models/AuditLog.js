const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseUser',
        required: true
    },
    adminEmail: String,
    adminRole: String,
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', 'OTHER']
    },
    resource: {
        type: String,
        required: true // e.g., 'Course', 'Registration', 'User'
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: Object // Store changes or payload
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

// Index for fast searching by admin or resource
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, action: 1 });

module.exports = mongoose.model('CourseAuditLog', auditLogSchema);