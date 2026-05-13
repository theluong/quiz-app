const supabase = require('../config/supabase');

async function getLeaderboard(req, res) {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('quiz_results')
      .select('*')
      .order('score', { ascending: false })
      .order('time_spent', { ascending: true })
      .order('correct_count', { ascending: false })
      .limit(50);
    
    if (category) {
      query = query.eq('category_id', category);
    }
    
    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    res.json({ results: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getLeaderboard };