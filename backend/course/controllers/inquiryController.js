const Inquiry = require('../models/Inquiry');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()-]{7,}$/;
const SERVICES = ['mobile', 'enterprise', 'api', 'cloud', 'ux', 'support', 'other'];

// Mirrors the validation the landing form already runs client-side, so a direct
// POST cannot fill the inbox with rows the admin page can neither call nor mail.
const classifyContact = (value) => {
    const trimmed = (value || '').trim();
    if (EMAIL_RE.test(trimmed)) return { contactType: 'email', email: trimmed };
    if (PHONE_RE.test(trimmed)) return { contactType: 'phone', phone: trimmed.replace(/[\s()-]/g, '') };
    return { contactType: 'unknown' };
};

// Create inquiry (public — called by the landing page contact forms)
exports.createInquiry = catchAsync(async (req, res, next) => {
    const {
        name,
        contact,
        companyName,
        service,
        serviceLabel,
        message,
        channel,
        source,
        lang
    } = req.body;

    const { contactType, email, phone } = classifyContact(contact);
    if (contactType === 'unknown') {
        return next(new AppError('يرجى إدخال رقم هاتف أو بريد إلكتروني صحيح', 400));
    }

    const inquiry = await Inquiry.create({
        name,
        contact: (contact || '').trim(),
        contactType,
        email,
        phone,
        companyName,
        // An unrecognised key falls back to 'other' — a renamed option on the
        // landing page should not cost us the lead with a validation error.
        service: SERVICES.includes(service) ? service : 'other',
        serviceLabel,
        message,
        channel: channel === 'email' ? 'email' : 'whatsapp',
        source: ['itland', 'web', 'course', 'other'].includes(source) ? source : 'itland',
        lang: lang === 'en' ? 'en' : 'ar',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')
    });

    res.status(201).json({
        status: 'success',
        data: { inquiry }
    });
});

// Get all inquiries (admin only)
exports.getAllInquiries = catchAsync(async (req, res, next) => {
    const { status, service, source, channel, search, limit } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (service && service !== 'all') query.service = service;
    if (source && source !== 'all') query.source = source;
    if (channel && channel !== 'all') query.channel = channel;

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { contact: { $regex: search, $options: 'i' } },
            { companyName: { $regex: search, $options: 'i' } },
            { message: { $regex: search, $options: 'i' } }
        ];
    }

    let dbQuery = Inquiry.find(query).sort('-createdAt');
    if (limit) dbQuery = dbQuery.limit(parseInt(limit, 10));

    const inquiries = await dbQuery;

    res.status(200).json({
        status: 'success',
        results: inquiries.length,
        data: { inquiries }
    });
});

// Get inquiry stats
exports.getInquiryStats = catchAsync(async (req, res, next) => {
    const stats = await Inquiry.getStats(req.query.source);

    const days = parseInt(req.query.days, 10) || 30;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const daily = await Inquiry.aggregate([
        { $match: { createdAt: { $gte: dateLimit } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
        status: 'success',
        data: { stats, daily }
    });
});

// Update inquiry status / notes
exports.updateInquiryStatus = catchAsync(async (req, res, next) => {
    const { status, notes } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
        return next(new AppError('Inquiry not found', 404));
    }

    if (status) inquiry.status = status;
    if (notes !== undefined) inquiry.notes = notes;

    await inquiry.save();

    res.status(200).json({
        status: 'success',
        data: { inquiry }
    });
});

// Delete inquiry
exports.deleteInquiry = catchAsync(async (req, res, next) => {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
        return next(new AppError('Inquiry not found', 404));
    }

    await inquiry.deleteOne();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Export inquiries to CSV
exports.exportInquiries = catchAsync(async (req, res, next) => {
    const inquiries = await Inquiry.find().sort('-createdAt');

    // Messages are free text and routinely contain commas and newlines, so every
    // cell is quoted and inner quotes doubled per RFC 4180.
    const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

    const header = [
        'Name', 'Contact', 'Contact Type', 'Company', 'Service',
        'Channel', 'Source', 'Status', 'Message', 'Created At'
    ];

    const rows = inquiries.map(i => [
        i.name, i.contact, i.contactType, i.companyName,
        i.serviceLabel || i.service, i.channel, i.source, i.status,
        i.message, i.createdAt.toISOString()
    ].map(cell).join(','));

    // BOM so Excel opens the Arabic columns as UTF-8 instead of mojibake.
    const csv = '\uFEFF' + [header.map(cell).join(','), ...rows].join('\n');

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('inquiries.csv');
    res.send(csv);
});
