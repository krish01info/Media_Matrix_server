const { pool } = require('../config/db');

const Reporter = {
  async getAll({ verified, independent, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];

    if (verified) { where += ' AND is_verified = 1'; }
    if (independent) { where += ' AND is_independent = 1'; }

    const [rows] = await pool.execute(
      `SELECT r.*, s.name as source_name, s.logo_url as source_logo
       FROM reporters r
       LEFT JOIN sources s ON r.source_id = s.id
       ${where}
       ORDER BY r.truth_score DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM reporters ${where}`, params
    );

    return { reporters: rows, total: countResult[0].total, page, limit };
  },

  async findBySlug(slug) {
    const [rows] = await pool.execute(
      `SELECT r.*, s.name as source_name, s.logo_url as source_logo
       FROM reporters r
       LEFT JOIN sources s ON r.source_id = s.id
       WHERE r.slug = ?`,
      [slug]
    );
    return rows[0] || null;
  },

  async getIndependentVoices(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT r.*, s.name as source_name
       FROM reporters r
       LEFT JOIN sources s ON r.source_id = s.id
       WHERE r.is_independent = 1
       ORDER BY r.truth_score DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  async create(data) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [result] = await pool.execute(
      `INSERT INTO reporters (name, slug, title, bio, avatar_url, truth_score,
        is_verified, is_independent, source_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.name, slug, data.title || null, data.bio || null,
       data.avatar_url || null, data.truth_score || 0,
       data.is_verified ? 1 : 0, data.is_independent ? 1 : 0, data.source_id || null]
    );
    return { id: result.insertId, slug };
  },
};

module.exports = Reporter;
