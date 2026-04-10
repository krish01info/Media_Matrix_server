const { pool } = require('../config/db');

const TrendingTopic = {
  async getActive(limit = 10) {
    const { rows } = await pool.query(
      `SELECT tt.*, r.name as region_name
       FROM trending_topics tt
       LEFT JOIN regions r ON tt.region_id = r.id
       WHERE tt.is_active = true
       ORDER BY tt.engagement_score DESC
       LIMIT $1`,
      [limit]
    );

    // Fetch articles for each topic
    for (const topic of rows) {
      const articleResult = await pool.query(
        `SELECT a.uuid, a.title, a.thumbnail_url
         FROM articles a
         JOIN trending_topic_articles tta ON a.id = tta.article_id
         WHERE tta.topic_id = $1`,
        [topic.id]
      );
      topic.articles = articleResult.rows;
    }

    return rows;
  },

  async create(data) {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { rows } = await pool.query(
      `INSERT INTO trending_topics (title, slug, engagement_score, engagement_label, region_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [data.title, slug, data.engagement_score || 0, data.engagement_label || null,
       data.region_id || null]
    );

    if (data.article_ids && data.article_ids.length > 0) {
      for (const aid of data.article_ids) {
        await pool.query(
          'INSERT INTO trending_topic_articles (topic_id, article_id) VALUES ($1, $2)',
          [rows[0].id, aid]
        );
      }
    }

    return { id: rows[0].id };
  },
};

module.exports = TrendingTopic;
