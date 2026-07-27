const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Log = require('../models/Log');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('بيانات الدخول غير صحيحة', 401));
  }

  if (!user.active) {
    return next(new AppError('هذا الحساب موقوف', 401));
  }

  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  // Log login
  await Log.create({
    action: 'login',
    desc: `دخل @${user.username}`,
    icon: '🔑',
    user: user.name,
    time: new Date(),
  });

  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});

// Optional logout - just inform client to delete token
exports.logout = (req, res) => {
  res.status(200).json({ status: 'success', message: 'تم تسجيل الخروج' });
};