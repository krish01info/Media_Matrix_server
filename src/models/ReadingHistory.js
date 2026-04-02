const { pool } = require('../config/db');

const ReadingHistory = {
  async getByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT urh.read_at, urh.read_duration_sec,
              a.uuid, a.title, a.thumbnail_url, a.truth_score, a.published_at,
              c.name as category_name,
              s.name as source_name
       FROM user_reading_history urh
       JOIN articles a ON urh.article_id = a.id
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE urh.user_id = ?
       ORDER BY urh.read_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_reading_history WHERE user_id = ?', [userId]
    );

    return { history: rows, total: countResult[0].total, page, limit };
  },

  async record(userId, articleUuid, durationSec = null) {
    const [article] = await pool.execute('SELECT id FROM articles WHERE uuid = ?', [articleUuid]);
    if (!article[0]) throw new Error('Article not found');

    await pool.execute(
      'INSERT INTO user_reading_history (user_id, article_id, read_duration_sec) VALUES (?, ?, ?)',
      [userId, article[0].id, durationSec]
    );

    // Increment article view count
    await pool.execute('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [article[0].id]);

    return { success: true };
  },
};

module.exports = ReadingHistory;
