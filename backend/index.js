require('dotenv').config({ path: __dirname + '/.env' });
const express = require("express");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const PORT = process.env.VERCEL ? 3000 : (process.env.PORT || 5000);
const app = express();
app.use(cors());
app.use(express.json());

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// GET /api/categories
app.get("/api/categories", async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ categories: data });
});

// GET /api/questions?category=UUID&limit=20|30|50
app.get("/api/questions", async (req, res) => {
  const { category, limit } = req.query;
  if (!category) return res.status(400).json({ error: "Missing category parameter" });

  const questionLimit = parseInt(limit) || 30;

  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, hint')
    .eq('category_id', category);

  if (error) return res.status(500).json({ error: error.message });

  const randomQuestions = shuffleArray(data || []).slice(0, questionLimit);

  const formattedQuestions = randomQuestions.map((q, index) => ({
    id: q.id,
    order: index + 1,
    question: q.question_text,
    options: {
      A: q.option_a,
      B: q.option_b,
      C: q.option_c,
      D: q.option_d
    },
    hint: q.hint
  }));

  res.json({ total: formattedQuestions.length, questions: formattedQuestions });
});

// POST /api/submit
app.post("/api/submit", async (req, res) => {
  const { answers } = req.body; // [{id, selected}]
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Invalid answers format" });
  }

  const questionIds = answers.map(a => a.id);
  const { data: dbQuestions, error } = await supabase
    .from('questions')
    .select('id, correct_option, question_text, option_a, option_b, option_c, option_d')
    .in('id', questionIds);

  if (error) return res.status(500).json({ error: error.message });

  let correctCount = 0;
  const results = answers.map((ans) => {
    const qDb = dbQuestions.find((q) => q.id === ans.id);
    if (!qDb) return { id: ans.id, correct: false };
    
    const isCorrect = qDb.correct_option === ans.selected;
    if (isCorrect) correctCount++;
    
    let correctText = "";
    if (qDb.correct_option === 'A') correctText = qDb.option_a;
    if (qDb.correct_option === 'B') correctText = qDb.option_b;
    if (qDb.correct_option === 'C') correctText = qDb.option_c;
    if (qDb.correct_option === 'D') correctText = qDb.option_d;

    let userText = "";
    if (ans.selected === 'A') userText = qDb.option_a;
    if (ans.selected === 'B') userText = qDb.option_b;
    if (ans.selected === 'C') userText = qDb.option_c;
    if (ans.selected === 'D') userText = qDb.option_d;

    return { 
      id: ans.id, 
      correct: isCorrect,
      question: qDb.question_text,
      userAnswer: ans.selected,
      userAnswerText: userText,
      correctAnswer: qDb.correct_option,
      correctAnswerText: correctText
    };
  });

  res.json({
    total: answers.length,
    answered: answers.length,
    correct: correctCount,
    wrong: answers.length - correctCount,
    score: answers.length ? Math.round((correctCount / answers.length) * 100) : 0,
    results,
  });
});

// GET /api/test
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend running OK with Supabase" });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;