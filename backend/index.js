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
  const { answers, allQuestionIds, totalQuestions, playerName, categoryName, timeSpent } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Invalid answers format" });
  }

  const answeredIds = answers.map(a => a.id);
  const skippedIds = (allQuestionIds || []).filter(id => !answeredIds.includes(id));
  
  let dbQuestions = [];
  
  if (answeredIds.length > 0) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, correct_option, question_text, option_a, option_b, option_c, option_d')
      .in('id', answeredIds);
    if (error) return res.status(500).json({ error: error.message });
    dbQuestions = data || [];
  }
  
  if (skippedIds.length > 0) {
    const { data: skippedData, error: skippedError } = await supabase
      .from('questions')
      .select('id, correct_option, question_text, option_a, option_b, option_c, option_d')
      .in('id', skippedIds);
    if (!skippedError && skippedData) {
      dbQuestions = [...dbQuestions, ...skippedData];
    }
  }

  let correctCount = 0;
  
  const results = answers.map((ans, index) => {
    const qDb = dbQuestions.find((q) => q.id === ans.id);
    if (!qDb) return { id: ans.id, correct: false, order: index + 1, skipped: false };

    const isCorrect = qDb.correct_option === ans.selected;
    if (isCorrect) correctCount++;

    const options = { A: qDb.option_a, B: qDb.option_b, C: qDb.option_c, D: qDb.option_d };

    return {
      id: ans.id,
      correct: isCorrect,
      order: index + 1,
      skipped: false,
      question: qDb.question_text,
      userAnswer: ans.selected,
      userAnswerText: options[ans.selected] || "",
      correctAnswer: qDb.correct_option,
      correctAnswerText: options[qDb.correct_option] || ""
    };
  });

  const total = totalQuestions || allQuestionIds?.length || answers.length;
  const answeredCount = answers.length;
  const skippedCount = Math.max(0, total - answeredCount);
  const finalCorrectCount = correctCount;
  const finalWrongCount = total - finalCorrectCount;

  const skippedResults = skippedIds.map((id, index) => {
    const qDb = dbQuestions.find((q) => q.id === id);
    const options = qDb ? { A: qDb.option_a, B: qDb.option_b, C: qDb.option_c, D: qDb.option_d } : {};
    
    return {
      id: `skipped_${id}`,
      skipped: true,
      order: answeredCount + index + 1,
      correct: false,
      question: qDb?.question_text || '',
      userAnswer: null,
      userAnswerText: '',
      correctAnswer: qDb?.correct_option || '',
      correctAnswerText: qDb ? options[qDb.correct_option] : ''
    };
  });

  const finalScore = total ? Math.round((finalCorrectCount / total) * 100) : 0;

  if (playerName) {
    const { error: insertError } = await supabase.from('quiz_results').insert({
      player_name: playerName,
      category_name: categoryName || '',
      total_questions: total,
      correct_count: finalCorrectCount,
      wrong_count: finalWrongCount,
      skipped_count: skippedCount,
      score: finalScore,
      time_spent: timeSpent || 0
    });
    if (insertError) {
      console.error('Error saving result:', insertError);
    }
  }

  res.json({
    total,
    answered: answeredCount,
    correct: finalCorrectCount,
    wrong: finalWrongCount,
    skipped: skippedCount,
    score: finalScore,
    results: [...results, ...skippedResults],
  });
});

// GET /api/leaderboard
app.get("/api/leaderboard", async (req, res) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .order('score', { ascending: false })
    .order('time_spent', { ascending: true })
    .order('correct_count', { ascending: false })
    .limit(20);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ results: data || [] });
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