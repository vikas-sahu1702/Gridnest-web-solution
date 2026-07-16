const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// GET all invoices with filters
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, sort = '-createdAt', status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'client.company': { $regex: search, $options: 'i' } },
        { 'client.email': { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const docs = await Invoice.find(filter).sort(sort).skip(skip).limit(parseInt(limit));
    const total = await Invoice.countDocuments(filter);
    res.status(200).json({
      success: true,
      data: docs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) { next(error); }
});

// GET invoice stats
router.get('/stats', async (req, res, next) => {
  try {
    const total = await Invoice.countDocuments();
    const draft = await Invoice.countDocuments({ status: 'draft' });
    const sent = await Invoice.countDocuments({ status: 'sent' });
    const paid = await Invoice.countDocuments({ status: 'paid' });
    const cancelled = await Invoice.countDocuments({ status: 'cancelled' });
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    const paidRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    res.status(200).json({
      success: true,
      data: {
        total, draft, sent, paid, cancelled,
        totalRevenue: totalRevenue[0]?.total || 0,
        paidRevenue: paidRevenue[0]?.total || 0,
      },
    });
  } catch (error) { next(error); }
});

// GET single invoice
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Invoice.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
});

// POST create invoice
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.invoiceNumber) {
      const year = new Date().getFullYear();
      const count = await Invoice.countDocuments();
      req.body.invoiceNumber = `GNWS-INV-${year}-${String(count + 1).padStart(3, '0')}`;
    }
    if (req.admin) req.body.createdBy = req.admin._id;
    const doc = await Invoice.create(req.body);
    res.status(201).json({ success: true, message: 'Invoice created', data: doc });
  } catch (error) { next(error); }
});

// PUT update invoice
router.put('/:id', async (req, res, next) => {
  try {
    const doc = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, message: 'Invoice updated', data: doc });
  } catch (error) { next(error); }
});

// DELETE invoice
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Invoice.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, message: 'Invoice deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
