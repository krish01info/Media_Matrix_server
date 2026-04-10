const { pool } = require('../config/db');

const Tag = {
  async getAll() {
    const { rows } = await pool.query('SELECT * FROM tags ORDER BY name ASC');
    return rows;
  },

  async findBySlug(slug) {
    const { rows } = await pool.query('SELECT * FROM tags WHERE slug = $1', [slug]);
    return rows[0] || null;
  },

  async create(name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { rows } = await pool.query(
      'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING id', [name, slug]
    );
    return { id: rows[0].id, name, slug };
  },
};

module.exports = Tag;
