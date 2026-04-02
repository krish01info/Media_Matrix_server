const { pool } = require('../config/db');

const Bookmark = {
  async getByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT ub.id, ub.created_at as bookmarked_at,
              a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.published_at,
              c.name as category_name,
              s.name as source_name, s.logo_url as source_logo
       FROM user_bookmarks ub
       JOIN articles a ON ub.article_id = a.id
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE ub.user_id = ?
       ORDER BY ub.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM user_bookmarks WHERE user_id = ?', [userId]
    );

    return { bookmarks: rows, total: countResult[0].total, page, limit };
  },

  async add(userId, articleUuid) {
    const [article] = await pool.execute('SELECT id FROM articles WHERE uuid = ?', [articleUuid]);
    if (!article[0]) throw new Error('Article not found');

    await pool.execute(
      'INSERT IGNORE INTO user_bookmarks (user_id, article_id) VALUES (?, ?)',
      [userId, article[0].id]
    );
    return { success: true };
  },

  async remove(userId, articleUuid) {
    const [article] = await pool.execute('SELECT id FROM articles WHERE uuid = ?', [articleUuid]);
    if (!article[0]) throw new Error('Article not found');

    await pool.execute(
      'DELETE FROM user_bookmarks WHERE user_id = ? AND article_id = ?',
      [userId, article[0].id]
    );
    return { success: true };
  },

  async isBookmarked(userId, articleUuid) {
    const [rows] = await pool.execute(
      `SELECT ub.id FROM user_bookmarks ub
       JOIN articles a ON ub.article_id = a.id
       WHERE ub.user_id = ? AND a.uuid = ?`,
      [userId, articleUuid]
    );
    return rows.length > 0;
  },
};

module.exports = Bookmark;
