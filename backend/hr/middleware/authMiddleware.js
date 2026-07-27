const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('غير مصرح به، يرجى تسجيل الدخول', 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('المستخدم غير موجود', 401));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('غير مصرح به، توكن غير صالح', 401));
  }
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles: ['admin', 'editor', 'viewer'] based on perms
    if (!req.user) return next(new AppError('غير مصرح به', 401));

    // admin has all perms
    if (req.user.perms.adm) return next();

    // check specific permission based on route
    // we'll handle permissions per controller
    next();
  };
};

// Permission middleware
const can = (perm) => {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('غير مصرح به', 401));
    if (req.user.perms[perm] || req.user.perms.adm) {
      return next();
    }
    return next(new AppError('ليس لديك صلاحية لهذه العملية', 403));
  };
};

module.exports = { protect, restrictTo, can };