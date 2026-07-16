const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    default: 'draft',
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  client: {
    company: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    gstNumber: { type: String, trim: true, default: '' },
    billingAddress: { type: String, trim: true, default: '' },
    shippingAddress: { type: String, trim: true, default: '' },
  },
  items: [{
    description: { type: String, trim: true },
    hsnSac: { type: String, trim: true, default: '998314' },
    rate: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    gstRate: { type: Number, default: 18 },
    amount: { type: Number, default: 0 },
  }],
  taxableAmount: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  additionalCharges: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  amountInWords: { type: String, default: '' },
  bankDetails: {
    holderName: { type: String, default: 'GridNest Solution' },
    bankName: { type: String, default: '' },
    accountNo: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    swiftCode: { type: String, default: '' },
  },
  terms: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, default: '' },
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
}, {
  timestamps: true,
});

invoiceSchema.index({ status: 1, createdAt: -1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ 'client.company': 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
