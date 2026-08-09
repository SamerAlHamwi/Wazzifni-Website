const mongoose = require('mongoose');

/**
 * Inbox for the landing-page project inquiries ("عندك فكرة أو نظام تريد بناءه؟").
 *
 * The IT Land contact form used to hand the message straight to WhatsApp/email
 * and keep no record, so nothing reached the dashboard. Submissions now land
 * here first and the WhatsApp/mail handover still happens on top of it.
 *
 * `source` is kept generic so the other landing pages (web, course) can post to
 * the same inbox later without a second collection.
 */
const inquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    // Exactly what the visitor typed — a phone number or an email address.
    contact: {
        type: String,
        required: [true, 'Contact is required'],
        trim: true
    },
    contactType: {
        type: String,
        enum: ['phone', 'email', 'unknown'],
        default: 'unknown'
    },
    // Split out from `contact` on create so the admin can search either field.
    phone: String,
    email: String,
    companyName: {
        type: String,
        trim: true
    },
    // Language-neutral key from the <select>; the label follows what was shown.
    service: {
        type: String,
        enum: ['mobile', 'enterprise', 'api', 'cloud', 'ux', 'support', 'other'],
        default: 'other'
    },
    serviceLabel: String,
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true
    },
    // Channel the visitor asked to be reached on.
    channel: {
        type: String,
        enum: ['whatsapp', 'email'],
        default: 'whatsapp'
    },
    source: {
        type: String,
        enum: ['itland', 'web', 'course', 'other'],
        default: 'itland'
    },
    lang: {
        type: String,
        enum: ['ar', 'en'],
        default: 'ar'
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'in-progress', 'won', 'lost'],
        default: 'new'
    },
    notes: String,
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1, source: 1 });

inquirySchema.statics.getStats = async function (source = null) {
    const match = source ? { source } : {};

    const stats = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                newCount: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
                contacted: { $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] } },
                inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
                won: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
                lost: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } }
            }
        }
    ]);

    return stats[0] || { total: 0, newCount: 0, contacted: 0, inProgress: 0, won: 0, lost: 0 };
};

module.exports = mongoose.model('Inquiry', inquirySchema);
