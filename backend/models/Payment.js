const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stripePaymentIntentId:{ type: String, default: '' },
  stripeInvoiceId:     { type: String, default: '' },
  amount:              { type: Number, required: true },   // in pence/cents
  currency:            { type: String, default: 'gbp' },
  plan:                { type: String, enum: ['monthly', 'yearly'] },
  status:              { type: String, enum: ['succeeded', 'failed', 'refunded'], default: 'succeeded' },
  charityId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Charity', default: null },
  charityAmount:       { type: Number, default: 0 },
  prizePoolAmount:     { type: Number, default: 0 },
  periodStart:         { type: Date },
  periodEnd:           { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
