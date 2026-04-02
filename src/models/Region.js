const { pool } = require('../config/db');

const Region = {
  async getAll() {
    const [rows] = await pool.execute('SELECT * FROM regions ORDER BY name ASC');
    return rows;
  },

  async getTopLevel() {
    const [rows] = await pool.execute(
      'SELECT * FROM regions WHERE parent_id IS NULL ORDER BY name ASC'
    );
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM regions WHERE slug = ?', [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM regions WHERE id = ?', [id]);
    return rows[0] || null;
  },
};

module.exports = Region;
