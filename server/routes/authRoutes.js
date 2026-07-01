const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/email');
const router = express.Router();

const signToken = (admin, rememberMe = false) => {
  const payload = {
    id: admin._id,
    role: admin.role,
    email: admin.email,
    lastActivity: Date.now(),
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? process.env.JWT_REMEMBER_EXPIRE || '30d' : process.env.JWT_EXPIRE || '1h',
  });
};

const sendTokenResponse = (admin, statusCode, res, rememberMe = false) => {
  const token = signToken(admin, rememberMe);
  admin.lastLogin = Date.now();
  admin.lastActivity = Date.now();
  admin.save({ validateBeforeSave: false });
  res.status(statusCode).json({
    success: true,
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
};

router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!admin.isActive) {
      return res.status(401).json({ success: false, message: 'This account has been deactivated.' });
    }
    sendTokenResponse(admin, 200, res, !!rememberMe);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
      lastLogin: req.admin.lastLogin,
    },
  });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email.' });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }
    const resetToken = admin.createPasswordResetToken();
    await admin.save({ validateBeforeSave: false });
    const resetURL = `${process.env.DOMAIN || 'http://localhost:5000'}/admin.html?reset=${resetToken}`;
    try {
      await sendEmail({
        to: admin.email,
        subject: 'Password Reset - Gridnest Admin',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
            <div style="text-align:center;margin-bottom:24px;">
              <h2 style="color:#0f172a;margin:0;">Gridnest Admin</h2>
              <p style="color:#64748b;font-size:14px;">Password Reset Request</p>
            </div>
            <div style="background:#fff;border-radius:8px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <p style="color:#0f172a;font-size:15px;line-height:1.6;">You requested a password reset. Click the button below to set a new password. This link expires in 10 minutes.</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${resetURL}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Reset Password</a>
              </div>
              <p style="color:#64748b;font-size:13px;">If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      admin.passwordResetToken = undefined;
      admin.passwordResetExpires = undefined;
      await admin.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent. Try again later.' });
    }
    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const admin = await Admin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }
    admin.password = password;
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();
    res.status(200).json({ success: true, message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
});

router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }
    const admin = await Admin.findById(req.admin._id).select('+password');
    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    admin.password = newPassword;
    await admin.save();
    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

router.post('/logout', protect, async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

router.post('/extend-session', protect, async (req, res) => {
  const token = signToken(req.admin);
  res.status(200).json({ success: true, token });
});

module.exports = router;
