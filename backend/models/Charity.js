const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  date:     { type: Date,   required: true },
  location: { type: String, default: '' },
  desc:     { type: String, default: '' },
}, { timestamps: false });

const charitySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDesc:   { type: String, default: '' },
  logo:        { type: String, default: '' },
  images:      [{ type: String }],
  website:     { type: String, default: '' },
  category:    { type: String, default: 'General' },
  events:      [eventSchema],
  isFeatured:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  totalReceived:{ type: Number, default: 0 },
  subscriberCount:{ type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Charity', charitySchema);
