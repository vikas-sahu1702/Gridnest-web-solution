const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  proposalNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  revision: {
    type: Number,
    default: 1,
    min: 1,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'approved', 'rejected', 'converted'],
    default: 'draft',
  },
  client: {
    company: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    gstNumber: { type: String, trim: true, default: '' },
  },
  proposalDate: {
    type: Date,
    default: Date.now,
  },
  plan: {
    type: String,
    enum: ['standard', 'custom-premium'],
    default: 'standard',
  },
  items: [{
    title: { type: String, trim: true },
    amount: { type: Number, default: 0 },
    category: { type: String, enum: ['core', 'additional'], default: 'core' },
  }],
  additionalCharges: [{
    title: { type: String, trim: true },
    amount: { type: Number, default: 0 },
  }],
  gst: {
    type: Number,
    default: 18,
  },
  discount: {
    type: Number,
    default: 0,
  },
  paymentTerms: {
    type: String,
    enum: ['50-advance', '100-advance', 'custom'],
    default: '50-advance',
  },
  paymentTermsCustom: {
    type: String,
    trim: true,
    default: '',
  },
  validity: {
    type: String,
    enum: ['7', '15', '30', 'custom'],
    default: '15',
  },
  validityCustom: {
    type: String,
    trim: true,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  subtotal: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  parentProposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    default: null,
  },
  convertedInvoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
}, {
  timestamps: true,
});

proposalSchema.index({ status: 1, createdAt: -1 });
proposalSchema.index({ proposalNumber: 1 });
proposalSchema.index({ parentProposalId: 1 });
proposalSchema.index({ 'client.company': 1 });

module.exports = mongoose.model('Proposal', proposalSchema);
