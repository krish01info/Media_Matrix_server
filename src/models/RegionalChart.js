const { pool } = require('../config/db');

const RegionalChart = {
  async getByRegion(regionSlug, date = null) {
    const chartDate = date || new Date().toISOString().split('T')[0];
    const { rows } = await pool.query(
      `SELECT rc.*, r.name as region_name, r.slug as region_slug,
              a.uuid as article_uuid, a.title as article_title
       FROM regional_charts rc
       JOIN regions r ON rc.region_id = r.id
       LEFT JOIN articles a ON rc.article_id = a.id
       WHERE r.slug = $1 AND rc.chart_date = $2
       ORDER BY rc."rank" ASC`,
      [regionSlug, chartDate]
    );
    return rows;
  },

  async getAll(date = null) {
    const chartDate = date || new Date().toISOString().split('T')[0];
    const { rows } = await pool.query(
      `SELECT rc.*, r.name as region_name, r.slug as region_slug
       FROM regional_charts rc
       JOIN regions r ON rc.region_id = r.id
       WHERE rc.chart_date = $1
       ORDER BY r.name ASC, rc."rank" ASC`,
      [chartDate]
    );
    return rows;
  },

  async create(data) {
    const { rows } = await pool.query(
      'INSERT INTO regional_charts ("rank", title, metric_label, region_id, article_id, chart_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [data.rank, data.title, data.metric_label || null, data.region_id,
       data.article_id || null, data.chart_date]
    );
    return { id: rows[0].id };
  },
};

module.exports = RegionalChart;
