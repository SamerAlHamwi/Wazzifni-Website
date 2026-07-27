const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Rep = require('../models/Rep');
const { JWT_SECRET } = process.env;

const protectSales = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'غير مصرح به، يرجى تسجيل الدخول' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Determine user type and fetch
    let user;
    if (decoded.role === 'admin' || decoded.role === 'superadmin') {
      user = await Admin.findById(decoded.id);
      if (user) user.role = user.isSuperAdmin ? 'superadmin' : 'admin';
    } else if (decoded.role === 'rep') {
      user = await Rep.findById(decoded.id);
      if (user) user.role = 'rep';
    }

    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'غير مصرح به، توكن غير صالح' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'ليس لديك صلاحية لهذه العملية' });
    }
    next();
  };
};

module.exports = { protectSales, restrictTo };