const { pool } = require('../config/db');

const Source = {
  async getAll() {
    const { rows } = await pool.query('SELECT * FROM sources ORDER BY name ASC');
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM sources WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const { rows } = await pool.query('SELECT * FROM sources WHERE slug = $1', [slug]);
    return rows[0] || null;
  },

  async create(data) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { rows } = await pool.query(
      `INSERT INTO sources (name, short_name, slug, logo_url, website_url, description,
        is_verified, trust_score, has_radio, has_newspaper)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [data.name, data.short_name || null, slug, data.logo_url || null,
       data.website_url || null, data.description || null, data.is_verified ? true : false,
       data.trust_score || 0, data.has_radio ? true : false, data.has_newspaper ? true : false]
    );
    return { id: rows[0].id, slug };
  },
};

module.exports = Source;
