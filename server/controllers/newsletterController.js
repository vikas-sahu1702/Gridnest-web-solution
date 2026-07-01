const Newsletter = require('../models/Newsletter');
const { sendWelcomeEmail, sendSubscriptionNotification } = require('../utils/email');

const subscribe = async (req, res, next) => {
  try {
    const { email, honeypot } = req.body;
    if (honeypot && honeypot.length > 0) {
      return res.status(200).json({ success: true, message: 'Thank you for subscribing!' });
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.status === 'active') {
        return res.status(409).json({ success: false, message: 'This email is already subscribed.' });
      }
      existing.status = 'active';
      existing.ipAddress = req.ip || req.connection.remoteAddress;
      await existing.save();
      return res.status(200).json({ success: true, message: 'Welcome back! Your subscription has been reactivated.' });
    }

    const subscription = await Newsletter.create({
      email, honeypot, ipAddress: req.ip || req.connection.remoteAddress,
    });

    sendWelcomeEmail(email).catch(err => console.error('Welcome email failed:', err.message));
    sendSubscriptionNotification(email).catch(err => console.error('Admin notification failed:', err.message));

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! Check your email for a welcome message.',
      data: { id: subscription._id, email: subscription.email, subscribedAt: subscription.subscribedAt },
    });
  } catch (error) {
    next(error);
  }
};

const unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email address is required' });

    const subscription = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!subscription) return res.status(404).json({ success: false, message: 'This email is not subscribed.' });
    if (subscription.status === 'unsubscribed') return res.status(400).json({ success: false, message: 'Already unsubscribed.' });

    subscription.status = 'unsubscribed';
    await subscription.save();
    res.status(200).json({ success: true, message: 'You have been successfully unsubscribed.' });
  } catch (error) {
    next(error);
  }
};

const getSubscribers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const subscribers = await Newsletter.find({ status: 'active' })
      .sort({ subscribedAt: -1 }).skip(skip).limit(limit)
      .select('-__v -honeypot -ipAddress');
    const total = await Newsletter.countDocuments({ status: 'active' });

    res.status(200).json({
      success: true, data: subscribers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

const getNewsletterStats = async (req, res, next) => {
  try {
    const total = await Newsletter.countDocuments();
    const active = await Newsletter.countDocuments({ status: 'active' });
    const unsubscribed = await Newsletter.countDocuments({ status: 'unsubscribed' });
    const thisMonth = await Newsletter.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    });

    res.status(200).json({ success: true, data: { total, active, unsubscribed, thisMonth } });
  } catch (error) { next(error); }
};

module.exports = { subscribe, unsubscribe, getSubscribers, getNewsletterStats };
