const { pool } = require('../config/db');

const Category = {
  async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC'
    );
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE slug = ?', [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [result] = await pool.execute(
      `INSERT INTO categories (name, slug, description, icon_url, gradient_start, gradient_end, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.name, slug, data.description || null, data.icon_url || null,
       data.gradient_start || null, data.gradient_end || null, data.display_order || 0]
    );
    return { id: result.insertId, slug };
  },
};

module.exports = Category;
