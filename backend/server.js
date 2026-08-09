const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Pro Advanced Security Packages
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Sales Routes
const repRoutes = require('./sales/routes/reps');
const actionRoutes = require('./sales/routes/actions');
const reportRoutes = require('./sales/routes/reports');
const adminRoutes = require('./sales/routes/admins');

// HR Routes
const hrAuthRoutes = require('./hr/routes/authRoutes');
const hrApplicantRoutes = require('./hr/routes/applicantRoutes');
const hrCompanyRoutes = require('./hr/routes/companyRoutes');
const hrPaymentRoutes = require('./hr/routes/paymentRoutes');
const hrUserRoutes = require('./hr/routes/userRoutes');
const hrDashboardRoutes = require('./hr/routes/dashboardRoutes');
const hrReportRoutes = require('./hr/routes/reportRoutes');
const hrAlertRoutes = require('./hr/routes/alertRoutes');
const hrLogRoutes = require('./hr/routes/logRoutes');
const hrImportExportRoutes = require('./hr/routes/importExportRoutes');
const hrSmsRoutes = require('./hr/routes/smsRoutes');

// Course Routes
const courseAuthRoutes = require('./course/routes/authRoutes');
const courseRoutes = require('./course/routes/courseRoutes');
const courseRegistrationRoutes = require('./course/routes/registrationRoutes');
const courseUserRoutes = require('./course/routes/userRoutes');
const courseInquiryRoutes = require('./course/routes/inquiryRoutes');

// HR Error Middleware
const hrErrorHandler = require('./hr/middleware/errorMiddleware');

const app = express();

// ==========================================
// 🛡️ PRO ADVANCED SECURITY MIDDLEWARES 🛡️
// ==========================================

// 1. Set Security HTTP Headers (helmet prevents XSS, clickjacking, etc.)
app.use(helmet({
  contentSecurityPolicy: false, // Set to false if it blocks your frontend assets (CSS/JS). Configure strictly in production.
  crossOriginEmbedderPolicy: false
}));

// 2. Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. API Rate Limiting (Prevents Brute-Force & DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window`
  message: { error: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة بعد قليل' }
});
// Apply rate limit only to API routes
app.use('/api', limiter);

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 10, // Max 10 failed login attempts per hour per IP
  message: { error: 'محاولات تسجيل دخول كثيرة جداً، يرجى المحاولة بعد ساعة' }
});

// Admin-specific Rate Limiting for high-risk operations (Course, HR, Sales)
const adminOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 50, // 50 write/delete operations per hour per IP
  message: { error: 'تم تجاوز الحد المسموح من العمليات الحساسة، يرجى المحاولة بعد ساعة' }
});

// Apply stricter rate limit to login routes
app.use('/api/sales/admins/login', loginLimiter);
app.use('/api/hr/auth/login', loginLimiter);
app.use('/api/course/auth/login', loginLimiter);

// 4. Body Parser with Size Limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// 6. Data Sanitization against XSS
app.use(xss());

// 7. Prevent HTTP Parameter Pollution
app.use(hpp());

// 8. CORS Config
app.use(cors({
  origin: '*', // For strict security, change '*' to your specific domains e.g., 'https://yourdomain.com'
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==========================================

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wazifni';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Seed initial HR data
    const seedAdminUser = require('./hr/utils/seedData');
    await seedAdminUser().catch(console.error);

    // Seed initial Course data (only if empty)
    const seedCourseData = require('./course/scripts/seed');
    // Call with exitOnFinish=false to prevent script from killing the server process
    // Call with forceClear=false to only seed if empty
    await seedCourseData(false, false).catch(err => {
        console.error('❌ Course seeding failed:', err.message);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Sales API Routes
app.use('/api/sales/reps', repRoutes);
app.use('/api/sales/actions', actionRoutes);
app.use('/api/sales/reports', reportRoutes);
app.use('/api/sales/admins', adminRoutes);

// HR API Routes
app.use('/api/hr/auth', hrAuthRoutes);
app.use('/api/hr/applicants', hrApplicantRoutes);
app.use('/api/hr/companies', hrCompanyRoutes);
app.use('/api/hr/payments', hrPaymentRoutes);
app.use('/api/hr/users', hrUserRoutes);
app.use('/api/hr/dashboard', hrDashboardRoutes);
app.use('/api/hr/reports', hrReportRoutes);
app.use('/api/hr/alerts', hrAlertRoutes);
app.use('/api/hr/logs', hrLogRoutes);
app.use('/api/hr/sms', hrSmsRoutes);
app.use('/api/hr', hrImportExportRoutes); // This handles /api/hr/export, etc.

// Course API Routes
app.use('/api/course/auth', courseAuthRoutes);
app.use('/api/course/courses', courseRoutes);
app.use('/api/course/registrations', courseRegistrationRoutes);
app.use('/api/course/users', courseUserRoutes);
app.use('/api/course/inquiries', courseInquiryRoutes);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Default route to rep.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'rep.html'));
});

// HR Dashboard Route (if applicable)
app.get('/hr', (req, res) => {
  res.sendFile(path.join(frontendPath, 'hr', 'index.html'));
});

// Course Dashboard Route
app.get('/course-admin', (req, res) => {
  res.sendFile(path.join(frontendPath, 'course', 'admin.html'));
});

// Error handling middleware for HR (handles AppError correctly)
app.use(hrErrorHandler);

// Generic Error handling middleware
app.use((err, req, res, next) => {
  if (err.statusCode) {
    // Already handled by hrErrorHandler
    return;
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Export for Vercel
module.exports = app;
