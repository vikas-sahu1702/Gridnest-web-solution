const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');

// GET all proposals with filters
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, sort = '-createdAt', status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { proposalNumber: { $regex: search, $options: 'i' } },
        { 'client.company': { $regex: search, $options: 'i' } },
        { 'client.email': { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const docs = await Proposal.find(filter).sort(sort).skip(skip).limit(parseInt(limit));
    const total = await Proposal.countDocuments(filter);
    res.status(200).json({
      success: true,
      data: docs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) { next(error); }
});

// GET proposal stats
router.get('/stats', async (req, res, next) => {
  try {
    const total = await Proposal.countDocuments();
    const draft = await Proposal.countDocuments({ status: 'draft' });
    const sent = await Proposal.countDocuments({ status: 'sent' });
    const approved = await Proposal.countDocuments({ status: 'approved' });
    const converted = await Proposal.countDocuments({ status: 'converted' });
    const rejected = await Proposal.countDocuments({ status: 'rejected' });
    const totalValue = await Proposal.aggregate([
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    res.status(200).json({
      success: true,
      data: { total, draft, sent, approved, converted, rejected, totalValue: totalValue[0]?.total || 0 },
    });
  } catch (error) { next(error); }
});

// GET single proposal
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Proposal.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Proposal not found' });
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
});

// POST create proposal
router.post('/', async (req, res, next) => {
  try {
    // Auto-generate proposal number
    if (!req.body.proposalNumber) {
      const year = new Date().getFullYear();
      const count = await Proposal.countDocuments();
      req.body.proposalNumber = `GNWS-${year}-${String(count + 1).padStart(3, '0')}`;
    }
    if (req.admin) req.body.createdBy = req.admin._id;
    const doc = await Proposal.create(req.body);
    res.status(201).json({ success: true, message: 'Proposal created', data: doc });
  } catch (error) { next(error); }
});

// PUT update proposal
router.put('/:id', async (req, res, next) => {
  try {
    const doc = await Proposal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Proposal not found' });
    res.status(200).json({ success: true, message: 'Proposal updated', data: doc });
  } catch (error) { next(error); }
});

// POST create revision
router.post('/:id/revise', async (req, res, next) => {
  try {
    const original = await Proposal.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const latestRevision = await Proposal.countDocuments({ parentProposalId: original._id });
    const newRevision = latestRevision + 1;

    const revisionData = original.toObject();
    delete revisionData._id;
    delete revisionData.createdAt;
    delete revisionData.updatedAt;
    delete revisionData.convertedInvoiceId;

    revisionData.revision = newRevision;
    revisionData.parentProposalId = original.parentProposalId || original._id;
    revisionData.status = 'draft';
    revisionData.proposalDate = Date.now();
    if (req.admin) revisionData.createdBy = req.admin._id;

    const doc = await Proposal.create(revisionData);
    res.status(201).json({ success: true, message: 'Revision created', data: doc });
  } catch (error) { next(error); }
});

// POST convert proposal to invoice
router.post('/:id/convert', async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (proposal.status === 'converted') return res.status(400).json({ success: false, message: 'Already converted' });

    const year = new Date().getFullYear();
    const Invoice = require('../models/Invoice');
    const invCount = await Invoice.countDocuments();
    const invoiceNumber = `GNWS-INV-${year}-${String(invCount + 1).padStart(3, '0')}`;

    const invoiceItems = proposal.items.map(item => ({
      description: item.title,
      hsnSac: '998314',
      rate: item.amount,
      quantity: 1,
      gstRate: proposal.gst || 18,
      amount: item.amount,
    }));

    const taxableAmount = proposal.subtotal || 0;
    const isInterstate = false;
    const gstRate = proposal.gst || 18;
    const cgst = isInterstate ? 0 : taxableAmount * (gstRate / 200);
    const sgst = isInterstate ? 0 : taxableAmount * (gstRate / 200);
    const igst = isInterstate ? taxableAmount * (gstRate / 100) : 0;

    const invoiceData = {
      invoiceNumber,
      status: 'draft',
      invoiceDate: Date.now(),
      client: { ...proposal.client },
      items: invoiceItems,
      taxableAmount,
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      igst: Math.round(igst * 100) / 100,
      totalTax: Math.round((cgst + sgst + igst) * 100) / 100,
      totalDiscount: proposal.discountAmount || 0,
      additionalCharges: (proposal.additionalCharges || []).reduce((s, c) => s + (c.amount || 0), 0),
      grandTotal: proposal.grandTotal || 0,
      bankDetails: {
        holderName: 'GridNest Solution',
      },
      proposalId: proposal._id,
      createdBy: req.admin?._id,
    };

    const invoice = await Invoice.create(invoiceData);
    proposal.status = 'converted';
    proposal.convertedInvoiceId = invoice._id;
    await proposal.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, message: 'Invoice created from proposal', data: invoice });
  } catch (error) { next(error); }
});

// DELETE proposal
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Proposal.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Proposal not found' });
    res.status(200).json({ success: true, message: 'Proposal deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
