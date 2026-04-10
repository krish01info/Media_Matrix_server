const { pool } = require('../config/db');

const Reporter = {
  async getAll({ verified, independent, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (verified) { where += ' AND is_verified = true'; }
    if (independent) { where += ' AND is_independent = true'; }

    params.push(limit);
    params.push(offset);

    const { rows } = await pool.query(
      `SELECT r.*, s.name as source_name, s.logo_url as source_logo
       FROM reporters r
       LEFT JOIN sources s ON r.source_id = s.id
       ${where}
       ORDER BY r.truth_score DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM reporters ${where}`
    );

    return { reporters: rows, total: parseInt(countResult.rows[0].total), page, limit };
  },

  async findBySlug(slug) {
    const { rows } = await pool.query(
      `SELECT r.*, s.name as source_name, s.logo_url as source_logo
       FROM reporters r
       LEFT JOIN sources s ON r.source_id = s.id
       WHERE r.slug = $1`,
      [slug]
    );
    return rows[0] || null;
  },

  async getIndependentVoices(limit = 10) {
    const { rows } = await pool.query(
      `SELECT r.*, s.name as source_name
       FROM reporters r
       LEFT JOIN sources s ON r.source_id = s.id
       WHERE r.is_independent = true
       ORDER BY r.truth_score DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async create(data) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { rows } = await pool.query(
      `INSERT INTO reporters (name, slug, title, bio, avatar_url, truth_score,
        is_verified, is_independent, source_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [data.name, slug, data.title || null, data.bio || null,
       data.avatar_url || null, data.truth_score || 0,
       data.is_verified ? true : false, data.is_independent ? true : false, data.source_id || null]
    );
    return { id: rows[0].id, slug };
  },
};

module.exports = Reporter;
