const { pool } = require('../config/db');

const WorldMapInsight = {
  async getActive() {
    const { rows } = await pool.query(
      `SELECT wmi.*, a.uuid as article_uuid, a.title as article_title
       FROM world_map_insights wmi
       LEFT JOIN articles a ON wmi.article_id = a.id
       WHERE wmi.is_active = true
       ORDER BY wmi.created_at DESC`
    );
    return rows;
  },

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO world_map_insights (title, description, latitude, longitude, icon_type, article_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [data.title, data.description || null, data.latitude, data.longitude,
       data.icon_type || null, data.article_id || null]
    );
    return { id: rows[0].id };
  },
};

module.exports = WorldMapInsight;
