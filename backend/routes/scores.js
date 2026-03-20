const express = require('express');
const router  = express.Router();
const { addScore, getScores, editScore, deleteScore } = require('../controllers/scoreController');
const { protect, requireSubscription } = require('../middleware/auth');

router.use(protect, requireSubscription);

router.get ('/',           getScores);
router.post('/',           addScore);
router.put ('/:scoreId',   editScore);
router.delete('/:scoreId', deleteScore);

module.exports = router;
