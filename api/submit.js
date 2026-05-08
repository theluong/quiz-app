const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { answers } = req.body;
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

    const options = { A: qDb.option_a, B: qDb.option_b, C: qDb.option_c, D: qDb.option_d };

    return {
      id: ans.id,
      correct: isCorrect,
      question: qDb.question_text,
      userAnswer: ans.selected,
      userAnswerText: options[ans.selected] || "",
      correctAnswer: qDb.correct_option,
      correctAnswerText: options[qDb.correct_option] || ""
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
};