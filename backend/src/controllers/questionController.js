const supabase = require('../config/supabase');
const { shuffleArray } = require('../utils/helpers');

async function getQuestions(req, res) {
  try {
    const { category, limit } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: 'Missing category parameter' });
    }

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getQuestions };