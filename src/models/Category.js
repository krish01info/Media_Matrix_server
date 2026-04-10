const { pool } = require('../config/db');

const Category = {
  async getAll() {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY display_order ASC'
    );
    return rows;
  },

  async findBySlug(slug) {
    const { rows } = await pool.query('SELECT * FROM categories WHERE slug = $1', [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug, description, icon_url, gradient_start, gradient_end, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [data.name, slug, data.description || null, data.icon_url || null,
       data.gradient_start || null, data.gradient_end || null, data.display_order || 0]
    );
    return { id: rows[0].id, slug };
  },
};

module.exports = Category;
