const { pool } = require('../config/db');

const RegionalChart = {
  async getByRegion(regionSlug, date = null) {
    const chartDate = date || new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(
      `SELECT rc.*, r.name as region_name, r.slug as region_slug,
              a.uuid as article_uuid, a.title as article_title
       FROM regional_charts rc
       JOIN regions r ON rc.region_id = r.id
       LEFT JOIN articles a ON rc.article_id = a.id
       WHERE r.slug = ? AND rc.chart_date = ?
       ORDER BY rc.\`rank\` ASC`,
      [regionSlug, chartDate]
    );
    return rows;
  },

  async getAll(date = null) {
    const chartDate = date || new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(
      `SELECT rc.*, r.name as region_name, r.slug as region_slug
       FROM regional_charts rc
       JOIN regions r ON rc.region_id = r.id
       WHERE rc.chart_date = ?
       ORDER BY r.name ASC, rc.\`rank\` ASC`,
      [chartDate]
    );
    return rows;
  },

  async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO regional_charts (`rank`, title, metric_label, region_id, article_id, chart_date) VALUES (?, ?, ?, ?, ?, ?)',
      [data.rank, data.title, data.metric_label || null, data.region_id,
       data.article_id || null, data.chart_date]
    );
    return { id: result.insertId };
  },
};

module.exports = RegionalChart;
