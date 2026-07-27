const { sendSMS } = require('../utils/smsService');
const catchAsync = require('../utils/catchAsync');

exports.sendSMS = catchAsync(async (req, res, next) => {
  const { recipient, message, apiKey } = req.body;

  const result = await sendSMS(recipient, message, apiKey);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
