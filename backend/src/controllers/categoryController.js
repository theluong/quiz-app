const supabase = require('../config/supabase');

async function getCategories(req, res) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ categories: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCategories };