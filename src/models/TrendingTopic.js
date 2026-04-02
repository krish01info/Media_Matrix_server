const { pool } = require('../config/db');

const TrendingTopic = {
  async getActive(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT tt.*, r.name as region_name
       FROM trending_topics tt
       LEFT JOIN regions r ON tt.region_id = r.id
       WHERE tt.is_active = 1
       ORDER BY tt.engagement_score DESC
       LIMIT ?`,
      [limit]
    );

    // Fetch articles for each topic
    for (const topic of rows) {
      const [articles] = await pool.execute(
        `SELECT a.uuid, a.title, a.thumbnail_url
         FROM articles a
         JOIN trending_topic_articles tta ON a.id = tta.article_id
         WHERE tta.topic_id = ?`,
        [topic.id]
      );
      topic.articles = articles;
    }

    return rows;
  },

  async create(data) {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [result] = await pool.execute(
      `INSERT INTO trending_topics (title, slug, engagement_score, engagement_label, region_id)
       VALUES (?, ?, ?, ?, ?)`,
      [data.title, slug, data.engagement_score || 0, data.engagement_label || null,
       data.region_id || null]
    );

    if (data.article_ids && data.article_ids.length > 0) {
      const values = data.article_ids.map(aid => [result.insertId, aid]);
      await pool.query('INSERT INTO trending_topic_articles (topic_id, article_id) VALUES ?', [values]);
    }

    return { id: result.insertId };
  },
};

module.exports = TrendingTopic;
