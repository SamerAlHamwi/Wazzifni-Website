const Log = require('../models/Log');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getLogs = catchAsync(async (req, res, next) => {
  const filterFeatures = new APIFeatures(Log.find(), req.query).filter();
  const total = await Log.countDocuments(filterFeatures.query.getFilter());

  const features = new APIFeatures(Log.find(), req.query)
    .filter()
    .sort()
    .paginate();

  const logs = await features.query;

  res.status(200).json({
    status: 'success',
    total,
    results: logs.length,
    data: { logs }
  });
});
