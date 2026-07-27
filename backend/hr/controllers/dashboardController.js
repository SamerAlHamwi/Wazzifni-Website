const Applicant = require('../models/Applicant');
const Payment = require('../models/Payment');
const catchAsync = require('../utils/catchAsync');

exports.getDashboard = catchAsync(async (req, res, next) => {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

  const totalApplicants = await Applicant.countDocuments();
  const accepted = await Applicant.countDocuments({ status: 'مقبول' });
  const rejected = await Applicant.countDocuments({ status: 'مرفوض' });
  const pending = await Applicant.countDocuments({ status: 'قيد المراجعة' });

  const paidCurrent = await Payment.aggregate([
    { $match: { status: 'مدفوع', month: currentMonth } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const paidPrevious = await Payment.aggregate([
    { $match: { status: 'مدفوع', month: prevMonth } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const paidCurrentAmount = paidCurrent.length ? paidCurrent[0].total : 0;
  const paidPreviousAmount = paidPrevious.length ? paidPrevious[0].total : 0;

  const lateCount = await Payment.countDocuments({ status: 'متأخر' });

  // Pipeline data (per status)
  const pipeline = [
    { status: 'إجمالي', count: totalApplicants },
    { status: 'قيد المراجعة', count: pending },
    { status: 'مقبول', count: accepted },
    { status: 'مرفوض', count: rejected },
  ];

  // Monthly commissions for last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  const monthlyData = await Payment.aggregate([
    { $match: { status: 'مدفوع', month: { $in: months } } },
    { $group: { _id: '$month', total: { $sum: '$amount' } } },
    { $sort: { _id: 1 } },
  ]);

  const monthlyMap = {};
  monthlyData.forEach(item => { monthlyMap[item._id] = item.total; });
  const commissions = months.map(m => monthlyMap[m] || 0);

  // Recent applicants
  const recent = await Applicant.find().sort('-createdAt').limit(6);

  res.status(200).json({
    status: 'success',
    data: {
      pipeline,
      stats: {
        totalApplicants,
        accepted,
        rejected,
        pending,
        paidCurrent: paidCurrentAmount,
        paidPrevious: paidPreviousAmount,
        lateCount,
      },
      monthlyCommissions: commissions,
      recent,
    },
  });
});