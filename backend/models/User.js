const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const scoreEntrySchema = new mongoose.Schema({
  value: { type: Number, required: true, min: 1, max: 45 },
  date:  { type: Date,   required: true },
}, { _id: true, timestamps: false });

const userSchema = new mongoose.Schema({
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6, select: false },
  role:       { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar:     { type: String, default: '' },

  // Subscription
  subscription: {
    stripeCustomerId:     { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    plan:                 { type: String, enum: ['monthly', 'yearly', null], default: null },
    status:               { type: String, enum: ['active', 'inactive', 'cancelled', 'past_due'], default: 'inactive' },
    currentPeriodEnd:     { type: Date, default: null },
    cancelAtPeriodEnd:    { type: Boolean, default: false },
  },

  // Golf scores — rolling max 5
  scores: {
    type: [scoreEntrySchema],
    default: [],
    validate: {
      validator: (arr) => arr.length <= 5,
      message: 'A maximum of 5 scores are stored per user.',
    },
  },

  // Charity contribution
  charity: {
    charityId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Charity', default: null },
    contributionPercent:{ type: Number, default: 10, min: 10, max: 100 },
  },

  // Draw participation tracker
  drawsEntered:    { type: Number, default: 0 },
  totalWinnings:   { type: Number, default: 0 },

  isVerified:      { type: Boolean, default: false },
  verifyToken:     { type: String },
  resetPassToken:  { type: String },
  resetPassExpire: { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Add a score — enforce rolling 5
userSchema.methods.addScore = function (value, date) {
  this.scores.push({ value, date: date || new Date() });
  // Sort descending by date, keep latest 5
  this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (this.scores.length > 5) this.scores = this.scores.slice(0, 5);
};

module.exports = mongoose.model('User', userSchema);
