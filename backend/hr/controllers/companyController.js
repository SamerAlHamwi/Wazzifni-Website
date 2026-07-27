const Company = require('../models/Company');
const Log = require('../models/Log');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
exports.getAllCompanies = catchAsync(async (req, res, next) => {
  const filterFeatures = new APIFeatures(Company.find(), req.query).filter();
  const total = await Company.countDocuments(filterFeatures.query.getFilter());

  const features = new APIFeatures(Company.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const companies = await features.query;

  res.status(200).json({
    status: 'success',
    results: companies.length,
    total,
    data: { companies },
  });
});

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private
exports.getCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    return next(new AppError('لم يتم العثور على الشركة', 404));
  }
  res.status(200).json({ status: 'success', data: { company } });
});

// @desc    Create new company
// @route   POST /api/companies
// @access  Private (requires add permission)
exports.createCompany = catchAsync(async (req, res, next) => {
  const company = await Company.create(req.body);

  await Log.create({
    action: 'add',
    desc: `إضافة شركة: ${company.name}`,
    icon: '🏢',
    user: req.user.name,
  });

  res.status(201).json({ status: 'success', data: { company } });
});

// @desc    Update company
// @route   PATCH /api/companies/:id
// @access  Private (requires edit permission)
exports.updateCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!company) {
    return next(new AppError('لم يتم العثور على الشركة', 404));
  }

  await Log.create({
    action: 'edit',
    desc: `تعديل شركة: ${company.name}`,
    icon: '🏢',
    user: req.user.name,
  });

  res.status(200).json({ status: 'success', data: { company } });
});

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (requires delete permission)
exports.deleteCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) {
    return next(new AppError('لم يتم العثور على الشركة', 404));
  }

  await Log.create({
    action: 'delete',
    desc: `حذف شركة: ${company.name}`,
    icon: '🏢',
    user: req.user.name,
  });

  res.status(204).json({ status: 'success', data: null });
});
