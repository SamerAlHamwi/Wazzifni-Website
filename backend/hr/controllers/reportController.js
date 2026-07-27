const Applicant = require('../models/Applicant');
const Payment = require('../models/Payment');
const catchAsync = require('../utils/catchAsync');

exports.getReports = catchAsync(async (req, res, next) => {
  const { month, company, status } = req.query;
  const match = {};

  if (month) match.month = month;
  if (company) match.company = company;
  if (status === 'مقبول' || status === 'مرفوض') {
    // status filter applies to applicants, not payments
  }

  // Payments for the month
  const payments = await Payment.find(match).populate('empId', 'name job company');

  const paid = payments.filter(p => p.status === 'مدفوع');
  const late = payments.filter(p => p.status === 'متأخر');
  const totalPaid = paid.reduce((sum, p) => sum + p.amount, 0);

  // New applicants in month (by interview date idate)
  const newApplicantsMatch = {};
  if (month) {
    const start = new Date(month + '-01');
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    newApplicantsMatch.idate = { $gte: start, $lt: end };
  }
  if (company) newApplicantsMatch.company = company;
  if (status && (status === 'مقبول' || status === 'مرفوض')) {
    newApplicantsMatch.status = status;
  }

  const newApplicants = await Applicant.countDocuments(newApplicantsMatch);
  const acceptedInMonth = await Applicant.countDocuments({ ...newApplicantsMatch, status: 'مقبول' });

  // Last 6 months data for chart
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  const monthlyCommissions = await Payment.aggregate([
    { $match: { status: 'مدفوع', month: { $in: months } } },
    { $group: { _id: '$month', total: { $sum: '$amount' } } },
  ]);

  const map = {};
  monthlyCommissions.forEach(m => { map[m._id] = m.total; });
  const chartData = months.map(m => map[m] || 0);

  res.status(200).json({
    status: 'success',
    data: {
      summary: {
        totalPaid,
        lateCount: late.length,
        newApplicants,
        acceptedInMonth,
      },
      payments,
      chartData,
      months,
    },
  });
});