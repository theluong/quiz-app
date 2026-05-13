const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
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
};
