const Applicant = require('../models/Applicant');
const Log = require('../models/Log');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllApplicants = catchAsync(async (req, res, next) => {
  // 1) Get total count for the filtered query (before pagination)
  const filterFeatures = new APIFeatures(Applicant.find(), req.query).filter();
  const total = await Applicant.countDocuments(filterFeatures.query.getFilter());

  // 2) Get the paginated results
  const features = new APIFeatures(Applicant.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const applicants = await features.query;

  res.status(200).json({
    status: 'success',
    results: applicants.length,
    total,
    data: { applicants },
  });
});

exports.getApplicant = catchAsync(async (req, res, next) => {
  const applicant = await Applicant.findById(req.params.id);
  if (!applicant) {
    return next(new AppError('لم يتم العثور على المتقدم', 404));
  }
  res.status(200).json({ status: 'success', data: { applicant } });
});

exports.createApplicant = catchAsync(async (req, res, next) => {
  const applicant = await Applicant.create(req.body);

  await Log.create({
    action: 'add',
    desc: `إضافة متقدم: ${applicant.name}`,
    icon: '➕',
    user: req.user.name,
  });

  res.status(201).json({ status: 'success', data: { applicant } });
});

exports.updateApplicant = catchAsync(async (req, res, next) => {
  const applicant = await Applicant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!applicant) {
    return next(new AppError('لم يتم العثور على المتقدم', 404));
  }

  await Log.create({
    action: 'edit',
    desc: `تعديل متقدم: ${applicant.name}`,
    icon: '✏️',
    user: req.user.name,
  });

  res.status(200).json({ status: 'success', data: { applicant } });
});

exports.deleteApplicant = catchAsync(async (req, res, next) => {
  const applicant = await Applicant.findByIdAndDelete(req.params.id);
  if (!applicant) {
    return next(new AppError('لم يتم العثور على المتقدم', 404));
  }

  await Log.create({
    action: 'delete',
    desc: `حذف متقدم: ${applicant.name}`,
    icon: '🗑️',
    user: req.user.name,
  });

  res.status(204).json({ status: 'success', data: null });
});
