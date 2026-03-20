const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchType:     { type: String, enum: ['5-match', '4-match', '3-match'], required: true },
  matchedNumbers:[{ type: Number }],
  prizeAmount:   { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'rejected'], default: 'pending' },
  proofUrl:      { type: String, default: '' },
  verifiedAt:    { type: Date, default: null },
  paidAt:        { type: Date, default: null },
  adminNote:     { type: String, default: '' },
});

const drawSchema = new mongoose.Schema({
  month:          { type: Number, required: true },       // 1–12
  year:           { type: Number, required: true },
  drawNumbers:    [{ type: Number, min: 1, max: 45 }],   // 5 numbers drawn
  drawType:       { type: String, enum: ['random', 'algorithmic'], default: 'random' },
  status:         { type: String, enum: ['pending', 'simulated', 'published'], default: 'pending' },

  // Prize pool breakdown
  pool: {
    total:       { type: Number, default: 0 },
    jackpot:     { type: Number, default: 0 },   // 40% — carries forward
    fourMatch:   { type: Number, default: 0 },   // 35%
    threeMatch:  { type: Number, default: 0 },   // 25%
    jackpotCarried: { type: Number, default: 0 },// rolled from previous month
  },

  totalParticipants:{ type: Number, default: 0 },
  winners:          [winnerSchema],

  publishedAt:      { type: Date, default: null },
  simulatedAt:      { type: Date, default: null },
  notes:            { type: String, default: '' },
}, { timestamps: true });

// Compound unique: one draw per month/year
drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);
