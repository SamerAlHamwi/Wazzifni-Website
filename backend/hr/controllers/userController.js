const User = require('../models/User');
const Log = require('../models/Log');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');
const bcrypt = require('bcryptjs');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const filterFeatures = new APIFeatures(User.find().select('-password'), req.query).filter();
  const total = await User.countDocuments(filterFeatures.query.getFilter());

  const features = new APIFeatures(User.find().select('-password'), req.query)
    .filter()
    .sort()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: 'success',
    total,
    results: users.length,
    data: { users }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return next(new AppError('المستخدم غير موجود', 404));
  res.status(200).json({ status: 'success', data: { user } });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, username, password, title, active, perms, role, color } = req.body;
  const user = await User.create({
    name,
    username,
    password,
    title,
    active,
    perms,
    role,
    color,
  });

  user.password = undefined;

  await Log.create({
    action: 'add',
    desc: `إضافة مستخدم: @${username}`,
    icon: '👤',
    user: req.user.name,
  });

  res.status(201).json({ status: 'success', data: { user } });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // Prevent password update here (use separate endpoint)
  const { name, username, title, active, perms, role, color } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, username, title, active, perms, role, color },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) return next(new AppError('المستخدم غير موجود', 404));

  await Log.create({
    action: 'edit',
    desc: `تعديل مستخدم: @${username}`,
    icon: '✏️',
    user: req.user.name,
  });

  res.status(200).json({ status: 'success', data: { user } });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError('المستخدم غير موجود', 404));

  await Log.create({
    action: 'delete',
    desc: `حذف مستخدم: @${user.username}`,
    icon: '🗑️',
    user: req.user.name,
  });

  res.status(204).json({ status: 'success', data: null });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('كلمة المرور الحالية غير صحيحة', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ status: 'success', message: 'تم تغيير كلمة المرور' });
});

exports.toggleActive = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('المستخدم غير موجود', 404));

  user.active = !user.active;
  await user.save();

  res.status(200).json({ status: 'success', data: { user } });
});
