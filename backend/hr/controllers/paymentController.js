const Payment = require('../models/Payment');
const Applicant = require('../models/Applicant');
const Log = require('../models/Log');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getAllPayments = catchAsync(async (req, res, next) => {
  const filterFeatures = new APIFeatures(Payment.find(), req.query).filter();
  const total = await Payment.countDocuments(filterFeatures.query.getFilter());

  const features = new APIFeatures(Payment.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const payments = await features.query.populate('empId', 'name job company');

  res.status(200).json({
    status: 'success',
    results: payments.length,
    total,
    data: { payments },
  });
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id).populate('empId', 'name job company');
  if (!payment) {
    return next(new AppError('لم يتم العثور على الدفعة', 404));
  }
  res.status(200).json({ status: 'success', data: { payment } });
});

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private (requires add permission)
exports.createPayment = catchAsync(async (req, res, next) => {
  const { empId, amount, month, pdate, status, note } = req.body;

  const applicant = await Applicant.findById(empId);
  if (!applicant) {
    return next(new AppError('الموظف غير موجود', 404));
  }
  if (applicant.status !== 'مقبول') {
    return next(new AppError('يمكن إضافة دفعات فقط للموظفين المقبولين', 400));
  }

  const paymentData = {
    empId,
    empName: applicant.name,
    job: applicant.job,
    company: applicant.company,
    amount,
    month,
    pdate,
    status: status || 'مدفوع',
    note,
  };

  const payment = await Payment.create(paymentData);

  await Log.create({
    action: 'add',
    desc: `إضافة دفعة: ${applicant.name} - ${amount}`,
    icon: '💰',
    user: req.user.name,
  });

  res.status(201).json({ status: 'success', data: { payment } });
});

// @desc    Update payment
// @route   PATCH /api/payments/:id
// @access  Private (requires edit permission)
exports.updatePayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('empId', 'name');

  if (!payment) {
    return next(new AppError('لم يتم العثور على الدفعة', 404));
  }

  await Log.create({
    action: 'edit',
    desc: `تعديل دفعة: ${payment.empName}`,
    icon: '💰',
    user: req.user.name,
  });

  res.status(200).json({ status: 'success', data: { payment } });
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private (requires delete permission)
exports.deletePayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);
  if (!payment) {
    return next(new AppError('لم يتم العثور على الدفعة', 404));
  }

  await Log.create({
    action: 'delete',
    desc: `حذف دفعة: ${payment.empName}`,
    icon: '💰',
    user: req.user.name,
  });

  res.status(204).json({ status: 'success', data: null });
});

// @desc    Get payments summary (for dashboard)
// @route   GET /api/payments/summary
// @access  Private
exports.getPaymentsSummary = catchAsync(async (req, res, next) => {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const paid = await Payment.countDocuments({ status: 'مدفوع' });
  const late = await Payment.countDocuments({ status: 'متأخر' });
  const soon = await Payment.countDocuments({ status: 'قريب' });

  const totalPaid = await Payment.aggregate([
    { $match: { status: 'مدفوع' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const currentMonthPaid = await Payment.aggregate([
    { $match: { status: 'مدفوع', month: currentMonth } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      counts: { paid, late, soon },
      totalPaid: totalPaid.length ? totalPaid[0].total : 0,
      currentMonthPaid: currentMonthPaid.length ? currentMonthPaid[0].total : 0,
    },
  });
});
