const express = require('express');
const router = express.Router();

const { getCategories } = require('../controllers/categoryController');
const { getQuestions } = require('../controllers/questionController');
const { submitQuiz } = require('../controllers/submitController');
const { getLeaderboard } = require('../controllers/leaderboardController');

router.get('/categories', getCategories);
router.get('/questions', getQuestions);
router.post('/submit', submitQuiz);
router.get('/leaderboard', getLeaderboard);
router.get('/test', (req, res) => {
  res.json({ message: 'Backend running OK with Supabase' });
});

module.exports = router;