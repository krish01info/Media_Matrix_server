const { pool } = require('../config/db');

const WorldMapInsight = {
  async getActive() {
    const [rows] = await pool.execute(
      `SELECT wmi.*, a.uuid as article_uuid, a.title as article_title
       FROM world_map_insights wmi
       LEFT JOIN articles a ON wmi.article_id = a.id
       WHERE wmi.is_active = 1
       ORDER BY wmi.created_at DESC`
    );
    return rows;
  },

  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO world_map_insights (title, description, latitude, longitude, icon_type, article_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.title, data.description || null, data.latitude, data.longitude,
       data.icon_type || null, data.article_id || null]
    );
    return { id: result.insertId };
  },
};

module.exports = WorldMapInsight;
