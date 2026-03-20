const User = require('../models/User');
const Draw = require('../models/Draw');

const PRIZE_SPLIT = { jackpot: 0.40, fourMatch: 0.35, threeMatch: 0.25 };

/**
 * Generate 5 unique random numbers between 1–45
 */
const randomDraw = () => {
  const nums = new Set();
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
  return [...nums].sort((a, b) => a - b);
};

/**
 * Algorithmic draw: weight numbers by how frequently (or infrequently)
 * they appear across all active subscribers' scores.
 * mode: 'most' — favours common scores | 'least' — favours rare scores
 */
const algorithmicDraw = async (mode = 'most') => {
  const users = await User.find({ 'subscription.status': 'active' }).select('scores');
  const freq = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;

  users.forEach(u => u.scores.forEach(s => { if (freq[s.value] !== undefined) freq[s.value]++; }));

  // Build weighted pool
  const pool = [];
  for (let n = 1; n <= 45; n++) {
    const w = mode === 'most' ? (freq[n] + 1) : (1 / (freq[n] + 1));
    // Weight determines how many times number appears in selection pool
    const slots = Math.ceil(w * 10);
    for (let i = 0; i < slots; i++) pool.push(n);
  }

  const selected = new Set();
  let attempts = 0;
  while (selected.size < 5 && attempts < 1000) {
    selected.add(pool[Math.floor(Math.random() * pool.length)]);
    attempts++;
  }
  // Fallback to random if algo fails
  if (selected.size < 5) return randomDraw();
  return [...selected].sort((a, b) => a - b);
};

/**
 * Calculate prize pools based on active subscriber count and plan prices
 */
const calculatePrizePools = async (carryForward = 0) => {
  const MONTHLY_POOL_CONTRIBUTION = 5; // £5 per monthly sub goes to prize pool
  const YEARLY_POOL_CONTRIBUTION  = 4; // £4/month equiv for yearly

  const monthly = await User.countDocuments({ 'subscription.status': 'active', 'subscription.plan': 'monthly' });
  const yearly  = await User.countDocuments({ 'subscription.status': 'active', 'subscription.plan': 'yearly' });

  const totalPool = (monthly * MONTHLY_POOL_CONTRIBUTION) + (yearly * YEARLY_POOL_CONTRIBUTION) + carryForward;

  return {
    total:          totalPool,
    jackpot:        parseFloat((totalPool * PRIZE_SPLIT.jackpot).toFixed(2)) + carryForward,
    fourMatch:      parseFloat((totalPool * PRIZE_SPLIT.fourMatch).toFixed(2)),
    threeMatch:     parseFloat((totalPool * PRIZE_SPLIT.threeMatch).toFixed(2)),
    jackpotCarried: carryForward,
  };
};

/**
 * Match user scores against draw numbers
 * Returns matched count and which numbers matched
 */
const matchUserScores = (userScores, drawNumbers) => {
  const userVals = userScores.map(s => s.value);
  const matched = drawNumbers.filter(n => userVals.includes(n));
  return { count: matched.length, matched };
};

/**
 * Find all winners for a draw
 */
const findWinners = async (drawNumbers) => {
  const users = await User.find({ 'subscription.status': 'active' }).select('scores firstName lastName email');
  const results = { fiveMatch: [], fourMatch: [], threeMatch: [] };

  users.forEach(user => {
    if (!user.scores.length) return;
    const { count, matched } = matchUserScores(user.scores, drawNumbers);
    if (count === 5) results.fiveMatch.push({ user, matched });
    else if (count === 4) results.fourMatch.push({ user, matched });
    else if (count === 3) results.threeMatch.push({ user, matched });
  });

  return results;
};

/**
 * Build winner documents with prize amounts (split equally per tier)
 */
const buildWinnerDocs = (winnerGroups, pool) => {
  const winners = [];

  const buildTier = (group, matchType, poolAmount) => {
    if (!group.length) return;
    const prizeEach = poolAmount / group.length;
    group.forEach(({ user, matched }) => {
      winners.push({
        userId:         user._id,
        matchType,
        matchedNumbers: matched,
        prizeAmount:    parseFloat(prizeEach.toFixed(2)),
        paymentStatus:  'pending',
      });
    });
  };

  buildTier(winnerGroups.threeMatch, '3-match', pool.threeMatch);
  buildTier(winnerGroups.fourMatch,  '4-match', pool.fourMatch);
  // 5-match jackpot: only distribute if there are winners, otherwise carry forward
  if (winnerGroups.fiveMatch.length) {
    buildTier(winnerGroups.fiveMatch, '5-match', pool.jackpot);
  }

  return winners;
};

module.exports = {
  randomDraw,
  algorithmicDraw,
  calculatePrizePools,
  findWinners,
  buildWinnerDocs,
};
