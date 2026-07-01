const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT) || 900000;

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin no longer exists or is inactive.' });
    }
    if (admin.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ success: false, message: 'Password recently changed. Please login again.' });
    }
    const now = Date.now();
    if (decoded.lastActivity && (now - decoded.lastActivity) > SESSION_TIMEOUT) {
      return res.status(401).json({ success: false, message: 'Session expired due to inactivity.' });
    }
    await Admin.findByIdAndUpdate(decoded.id, { lastActivity: now });
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id);
    }
  } catch (e) {}
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
