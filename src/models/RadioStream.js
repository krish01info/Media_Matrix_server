const { pool } = require('../config/db');

const RadioStream = {
  async getAll() {
    const [rows] = await pool.execute(
      `SELECT rs.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM radio_streams rs
       JOIN sources s ON rs.source_id = s.id
       ORDER BY rs.display_order ASC`
    );
    return rows;
  },

  async getLive() {
    const [rows] = await pool.execute(
      `SELECT rs.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM radio_streams rs
       JOIN sources s ON rs.source_id = s.id
       WHERE rs.is_live = 1
       ORDER BY rs.display_order ASC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT rs.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM radio_streams rs
       JOIN sources s ON rs.source_id = s.id
       WHERE rs.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO radio_streams (source_id, title, description, stream_url, thumbnail_url,
        is_live, is_high_quality, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.source_id, data.title, data.description || null, data.stream_url,
       data.thumbnail_url || null, data.is_live ? 1 : 0, data.is_high_quality ? 1 : 0,
       data.display_order || 0]
    );
    return { id: result.insertId };
  },

  async updateLiveStatus(id, isLive) {
    await pool.execute('UPDATE radio_streams SET is_live = ? WHERE id = ?', [isLive ? 1 : 0, id]);
  },
};

module.exports = RadioStream;
