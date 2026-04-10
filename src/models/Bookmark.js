const { pool } = require('../config/db');

const Bookmark = {
  async getByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT ub.id, ub.created_at as bookmarked_at,
              a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.published_at,
              c.name as category_name,
              s.name as source_name, s.logo_url as source_logo
       FROM user_bookmarks ub
       JOIN articles a ON ub.article_id = a.id
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE ub.user_id = $1
       ORDER BY ub.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM user_bookmarks WHERE user_id = $1', [userId]
    );

    return { bookmarks: rows, total: parseInt(countResult.rows[0].total), page, limit };
  },

  async add(userId, articleUuid) {
    const articleResult = await pool.query('SELECT id FROM articles WHERE uuid = $1', [articleUuid]);
    if (!articleResult.rows[0]) throw new Error('Article not found');

    await pool.query(
      'INSERT INTO user_bookmarks (user_id, article_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, articleResult.rows[0].id]
    );
    return { success: true };
  },

  async remove(userId, articleUuid) {
    const articleResult = await pool.query('SELECT id FROM articles WHERE uuid = $1', [articleUuid]);
    if (!articleResult.rows[0]) throw new Error('Article not found');

    await pool.query(
      'DELETE FROM user_bookmarks WHERE user_id = $1 AND article_id = $2',
      [userId, articleResult.rows[0].id]
    );
    return { success: true };
  },

  async isBookmarked(userId, articleUuid) {
    const { rows } = await pool.query(
      `SELECT ub.id FROM user_bookmarks ub
       JOIN articles a ON ub.article_id = a.id
       WHERE ub.user_id = $1 AND a.uuid = $2`,
      [userId, articleUuid]
    );
    return rows.length > 0;
  },
};

module.exports = Bookmark;
