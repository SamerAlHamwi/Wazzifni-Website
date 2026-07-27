const Applicant = require('../models/Applicant');
const Payment = require('../models/Payment');
const catchAsync = require('../utils/catchAsync');

exports.getAlerts = catchAsync(async (req, res, next) => {
  const { type, company } = req.query;

  const now = new Date();
  const acceptedApplicants = Applicant.find({ status: 'مقبول', sdate: { $exists: true, $ne: null } });

  if (company) {
    acceptedApplicants.where('company').equals(company);
  }

  const accepted = await acceptedApplicants;

  // Overdue (>=25 days)
  const over = accepted.filter(a => {
    const days = Math.floor((now - new Date(a.sdate)) / 86400000);
    return days >= 25;
  });

  // Near (18-24 days)
  const near = accepted.filter(a => {
    const days = Math.floor((now - new Date(a.sdate)) / 86400000);
    return days >= 18 && days < 25;
  });

  // OK (<18)
  const ok = accepted.filter(a => {
    const days = Math.floor((now - new Date(a.sdate)) / 86400000);
    return days < 18;
  });

  // Late payments
  const latePaymentsQuery = Payment.find({ status: 'متأخر' });
  if (company) latePaymentsQuery.where('company').equals(company);
  const latePayments = await latePaymentsQuery;

  // Apply type filter
  let overResult = over;
  let nearResult = near;
  let okResult = ok;
  let lateResult = latePayments;

  if (type === 'over') {
    nearResult = [];
    okResult = [];
    lateResult = [];
  } else if (type === 'near') {
    overResult = [];
    okResult = [];
    lateResult = [];
  } else if (type === 'ok') {
    overResult = [];
    nearResult = [];
    lateResult = [];
  } else if (type === 'latepay') {
    overResult = [];
    nearResult = [];
    okResult = [];
  }

  res.status(200).json({
    status: 'success',
    data: {
      over: overResult,
      near: nearResult,
      ok: okResult,
      latePayments: lateResult,
    },
  });
});