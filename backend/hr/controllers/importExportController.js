const Applicant = require('../models/Applicant');
const Company = require('../models/Company');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Log = require('../models/Log');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.exportData = catchAsync(async (req, res, next) => {
  const applicants = await Applicant.find();
  const companies = await Company.find();
  const payments = await Payment.find();
  const users = await User.find().select('-password');

  const backup = {
    version: 1,
    exportedAt: new Date(),
    applicants,
    companies,
    payments,
    users,
  };

  res.status(200).json({ status: 'success', data: backup });
});

exports.importData = catchAsync(async (req, res, next) => {
  const { applicants, companies, payments, users } = req.body;

  if (!applicants || !companies || !payments || !users) {
    return next(new AppError('البيانات غير مكتملة', 400));
  }

  // Clear existing data
  await Applicant.deleteMany({});
  await Company.deleteMany({});
  await Payment.deleteMany({});
  await User.deleteMany({});

  // Insert new data
  await Applicant.insertMany(applicants);
  await Company.insertMany(companies);
  await Payment.insertMany(payments);
  // Ensure at least one admin exists
  let adminExists = users.some(u => u.perms && u.perms.adm);
  if (!adminExists) {
    users.push({
      name: 'مدير النظام',
      username: 'admin',
      password: 'admin123', // will be hashed by pre-save
      title: 'مسؤول',
      active: true,
      color: '#f68b29',
      perms: { add: true, edit: true, del: true, pay: true, rep: true, adm: true },
    });
  }
  await User.insertMany(users);

  await Log.create({
    action: 'import',
    desc: 'استيراد نسخة احتياطية',
    icon: '📂',
    user: req.user.name,
  });

  res.status(200).json({ status: 'success', message: 'تم استيراد البيانات بنجاح' });
});