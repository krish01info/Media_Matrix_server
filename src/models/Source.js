const { pool } = require('../config/db');

const Source = {
  async getAll() {
    const [rows] = await pool.execute('SELECT * FROM sources ORDER BY name ASC');
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM sources WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM sources WHERE slug = ?', [slug]);
    return rows[0] || null;
  },

  async create(data) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [result] = await pool.execute(
      `INSERT INTO sources (name, short_name, slug, logo_url, website_url, description,
        is_verified, trust_score, has_radio, has_newspaper)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.short_name || null, slug, data.logo_url || null,
       data.website_url || null, data.description || null, data.is_verified ? 1 : 0,
       data.trust_score || 0, data.has_radio ? 1 : 0, data.has_newspaper ? 1 : 0]
    );
    return { id: result.insertId, slug };
  },
};

module.exports = Source;
