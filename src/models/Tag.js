const { pool } = require('../config/db');

const Tag = {
  async getAll() {
    const [rows] = await pool.execute('SELECT * FROM tags ORDER BY name ASC');
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM tags WHERE slug = ?', [slug]);
    return rows[0] || null;
  },

  async create(name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [result] = await pool.execute(
      'INSERT INTO tags (name, slug) VALUES (?, ?)', [name, slug]
    );
    return { id: result.insertId, name, slug };
  },
};

module.exports = Tag;
