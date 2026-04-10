const { pool } = require('../config/db');

const CompareCoverage = {
  async getActive() {
    const { rows } = await pool.query(
      'SELECT * FROM compare_coverages WHERE is_active = true ORDER BY created_at DESC'
    );

    for (const coverage of rows) {
      const itemResult = await pool.query(
        `SELECT cci.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo,
                a.uuid as article_uuid
         FROM compare_coverage_items cci
         JOIN sources s ON cci.source_id = s.id
         LEFT JOIN articles a ON cci.article_id = a.id
         WHERE cci.compare_id = $1`,
        [coverage.id]
      );
      coverage.items = itemResult.rows;
    }

    return rows;
  },

  async create(data) {
    const { rows } = await pool.query(
      'INSERT INTO compare_coverages (topic_title) VALUES ($1) RETURNING id',
      [data.topic_title]
    );

    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        await pool.query(
          `INSERT INTO compare_coverage_items (compare_id, source_id, headline, stance_label, image_url, article_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [rows[0].id, item.source_id, item.headline, item.stance_label || null,
           item.image_url || null, item.article_id || null]
        );
      }
    }

    return { id: rows[0].id };
  },
};

module.exports = CompareCoverage;
