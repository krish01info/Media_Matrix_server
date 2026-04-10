const { pool } = require('../config/db');

const Podcast = {
  async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT p.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM podcasts p
       JOIN sources s ON p.source_id = s.id
       ORDER BY p.published_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT p.*, s.name as source_name, s.logo_url as source_logo
       FROM podcasts p
       JOIN sources s ON p.source_id = s.id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO podcasts (source_id, title, description, audio_url, thumbnail_url,
        duration_seconds, episode_number, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [data.source_id, data.title, data.description || null, data.audio_url,
       data.thumbnail_url || null, data.duration_seconds || null,
       data.episode_number || null, data.published_at || new Date()]
    );
    return { id: rows[0].id };
  },
};

module.exports = Podcast;
