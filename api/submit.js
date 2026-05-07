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
};