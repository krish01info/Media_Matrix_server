const { pool } = require('../config/db');

const RadioStream = {
  async getAll() {
    const { rows } = await pool.query(
      `SELECT rs.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM radio_streams rs
       JOIN sources s ON rs.source_id = s.id
       ORDER BY rs.display_order ASC`
    );
    return rows;
  },

  async getLive() {
    const { rows } = await pool.query(
      `SELECT rs.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM radio_streams rs
       JOIN sources s ON rs.source_id = s.id
       WHERE rs.is_live = true
       ORDER BY rs.display_order ASC`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT rs.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM radio_streams rs
       JOIN sources s ON rs.source_id = s.id
       WHERE rs.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO radio_streams (source_id, title, description, stream_url, thumbnail_url,
        is_live, is_high_quality, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [data.source_id, data.title, data.description || null, data.stream_url,
       data.thumbnail_url || null, data.is_live ? true : false, data.is_high_quality ? true : false,
       data.display_order || 0]
    );
    return { id: rows[0].id };
  },

  async updateLiveStatus(id, isLive) {
    await pool.query('UPDATE radio_streams SET is_live = $1 WHERE id = $2', [isLive ? true : false, id]);
  },
};

module.exports = RadioStream;
