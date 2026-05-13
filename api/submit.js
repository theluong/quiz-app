const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
};