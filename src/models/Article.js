const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Article = {
  // Create article
  async create(data) {
    const uuid = uuidv4();
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [result] = await pool.execute(
      `INSERT INTO articles (uuid, title, subtitle, slug, content, summary, image_url, thumbnail_url,
        category_id, source_id, reporter_id, truth_score, is_verified, is_featured, is_breaking,
        is_developing, is_live, is_morning_brief, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [uuid, data.title, data.subtitle || null, slug, data.content, data.summary || null,
       data.image_url || null, data.thumbnail_url || null, data.category_id, data.source_id,
       data.reporter_id || null, data.truth_score || 0, data.is_verified ? 1 : 0,
       data.is_featured ? 1 : 0, data.is_breaking ? 1 : 0, data.is_developing ? 1 : 0,
       data.is_live ? 1 : 0, data.is_morning_brief ? 1 : 0]
    );
    const articleId = result.insertId;

    // Insert tags
    if (data.tag_ids && data.tag_ids.length > 0) {
      const tagValues = data.tag_ids.map(tid => [articleId, tid]);
      await pool.query('INSERT INTO article_tags (article_id, tag_id) VALUES ?', [tagValues]);
    }

    // Insert regions
    if (data.region_ids && data.region_ids.length > 0) {
      const regionValues = data.region_ids.map(rid => [articleId, rid]);
      await pool.query('INSERT INTO article_regions (article_id, region_id) VALUES ?', [regionValues]);
    }

    return { id: articleId, uuid };
  },

  // Get article by UUID (full detail)
  async findByUuid(uuid) {
    const [rows] = await pool.execute(
      `SELECT a.*, c.name as category_name, c.slug as category_slug,
              s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo,
              s.trust_score as source_trust_score,
              r.name as reporter_name, r.avatar_url as reporter_avatar, r.truth_score as reporter_truth_score
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       LEFT JOIN reporters r ON a.reporter_id = r.id
       WHERE a.uuid = ?`,
      [uuid]
    );
    if (!rows[0]) return null;

    // Get tags
    const [tags] = await pool.execute(
      `SELECT t.id, t.name, t.slug FROM tags t
       JOIN article_tags at2 ON t.id = at2.tag_id
       WHERE at2.article_id = ?`,
      [rows[0].id]
    );

    // Get regions
    const [regions] = await pool.execute(
      `SELECT r.id, r.name, r.slug FROM regions r
       JOIN article_regions ar ON r.id = ar.region_id
       WHERE ar.article_id = ?`,
      [rows[0].id]
    );

    return { ...rows[0], tags, regions };
  },

  // Featured articles
  async getFeatured(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.subtitle, a.image_url, a.thumbnail_url, a.truth_score,
              a.interaction_count, a.published_at,
              c.name as category_name, c.slug as category_slug,
              s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE a.is_featured = 1
       ORDER BY a.published_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  // Trending articles (by interaction count)
  async getTrending(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.subtitle, a.image_url, a.thumbnail_url, a.truth_score,
              a.is_verified, a.interaction_count, a.published_at,
              c.name as category_name,
              s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo,
              s.trust_score as source_trust_score
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE a.published_at >= NOW() - INTERVAL 7 DAY
       ORDER BY a.interaction_count DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  // Top Charts (ranked by interactions with formatted count)
  async getTopCharts(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.interaction_count, a.published_at, a.thumbnail_url,
              c.name as category_name
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       WHERE a.published_at >= NOW() - INTERVAL 30 DAY
       ORDER BY a.interaction_count DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  // Morning Brief articles
  async getMorningBrief(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.summary, a.thumbnail_url, a.published_at,
              c.name as category_name, c.slug as category_slug,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE a.is_morning_brief = 1
       ORDER BY a.published_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  // Developing Now
  async getDeveloping(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url, a.truth_score,
              a.is_live, a.published_at,
              c.name as category_name,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE a.is_developing = 1
       ORDER BY a.published_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  // Breaking / Live updates (Global Affairs Highlights)
  async getHighlights(limit = 5) {
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.subtitle, a.image_url, a.thumbnail_url, a.is_live,
              a.is_breaking, a.truth_score, a.published_at,
              c.name as category_name,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE (a.is_breaking = 1 OR a.is_live = 1)
         AND a.category_id = (SELECT id FROM categories WHERE slug = 'global-affairs')
       ORDER BY a.published_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  // Articles by category
  async getByCategory(categorySlug, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.interaction_count, a.published_at,
              c.name as category_name,
              s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE c.slug = ?
       ORDER BY a.published_at DESC
       LIMIT ? OFFSET ?`,
      [categorySlug, limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM articles a JOIN categories c ON a.category_id = c.id WHERE c.slug = ?',
      [categorySlug]
    );

    return { articles: rows, total: countResult[0].total, page, limit };
  },

  // Articles by source
  async getBySource(sourceSlug, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.interaction_count, a.published_at,
              c.name as category_name,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE s.slug = ?
       ORDER BY a.published_at DESC
       LIMIT ? OFFSET ?`,
      [sourceSlug, limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM articles a JOIN sources s ON a.source_id = s.id WHERE s.slug = ?',
      [sourceSlug]
    );

    return { articles: rows, total: countResult[0].total, page, limit };
  },

  // Articles by reporter
  async getByReporter(reporterSlug, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.published_at,
              c.name as category_name,
              s.name as source_name,
              r.name as reporter_name, r.avatar_url as reporter_avatar
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       JOIN reporters r ON a.reporter_id = r.id
       WHERE r.slug = ?
       ORDER BY a.published_at DESC
       LIMIT ? OFFSET ?`,
      [reporterSlug, limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM articles a JOIN reporters r ON a.reporter_id = r.id WHERE r.slug = ?',
      [reporterSlug]
    );

    return { articles: rows, total: countResult[0].total, page, limit };
  },

  // Articles by region
  async getByRegion(regionSlug, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.interaction_count, a.published_at,
              c.name as category_name,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       JOIN article_regions ar ON a.id = ar.article_id
       JOIN regions reg ON ar.region_id = reg.id
       WHERE reg.slug = ?
       ORDER BY a.published_at DESC
       LIMIT ? OFFSET ?`,
      [regionSlug, limit, offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM articles a
       JOIN article_regions ar ON a.id = ar.article_id
       JOIN regions reg ON ar.region_id = reg.id WHERE reg.slug = ?`,
      [regionSlug]
    );

    return { articles: rows, total: countResult[0].total, page, limit };
  },

  // Articles by tag
  async getByTag(tagSlug, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.published_at,
              c.name as category_name,
              s.name as source_name
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       JOIN article_tags at2 ON a.id = at2.article_id
       JOIN tags t ON at2.tag_id = t.id
       WHERE t.slug = ?
       ORDER BY a.published_at DESC
       LIMIT ? OFFSET ?`,
      [tagSlug, limit, offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM articles a
       JOIN article_tags at2 ON a.id = at2.article_id
       JOIN tags t ON at2.tag_id = t.id WHERE t.slug = ?`,
      [tagSlug]
    );

    return { articles: rows, total: countResult[0].total, page, limit };
  },

  // Full-text search
  async search({ q, scope, verified, category, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let where = 'WHERE MATCH(a.title, a.content, a.summary) AGAINST(? IN BOOLEAN MODE)';
    const params = [q];

    if (verified) {
      where += ' AND a.is_verified = 1';
    }
    if (category) {
      where += ' AND c.slug = ?';
      params.push(category);
    }

    const query = `
      SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
             a.truth_score, a.is_verified, a.published_at,
             c.name as category_name, c.slug as category_slug,
             s.name as source_name, s.logo_url as source_logo,
             MATCH(a.title, a.content, a.summary) AGAINST(? IN BOOLEAN MODE) as relevance
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      JOIN sources s ON a.source_id = s.id
      ${where}
      ORDER BY relevance DESC
      LIMIT ? OFFSET ?
    `;

    params.push(q); // for ORDER BY relevance
    // Fix: the AGAINST in SELECT needs q again — handled by repeating in the query
    // Actually let's simplify
    const [rows] = await pool.execute(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.is_verified, a.published_at,
              c.name as category_name, c.slug as category_slug,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       ${where}
       ORDER BY a.published_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { articles: rows, page, limit };
  },

  // Update article
  async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['title', 'subtitle', 'content', 'summary', 'image_url', 'thumbnail_url',
      'category_id', 'source_id', 'reporter_id', 'truth_score', 'is_verified', 'is_featured',
      'is_breaking', 'is_developing', 'is_live', 'is_morning_brief'];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (data.title) {
      fields.push('slug = ?');
      values.push(data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.execute(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    // Update tags
    if (data.tag_ids) {
      await pool.execute('DELETE FROM article_tags WHERE article_id = ?', [id]);
      if (data.tag_ids.length > 0) {
        const tagValues = data.tag_ids.map(tid => [id, tid]);
        await pool.query('INSERT INTO article_tags (article_id, tag_id) VALUES ?', [tagValues]);
      }
    }

    // Update regions
    if (data.region_ids) {
      await pool.execute('DELETE FROM article_regions WHERE article_id = ?', [id]);
      if (data.region_ids.length > 0) {
        const regionValues = data.region_ids.map(rid => [id, rid]);
        await pool.query('INSERT INTO article_regions (article_id, region_id) VALUES ?', [regionValues]);
      }
    }

    return this.findById(id);
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM articles WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async delete(id) {
    await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
  },

  // Increment view count
  async incrementView(uuid) {
    await pool.execute('UPDATE articles SET view_count = view_count + 1 WHERE uuid = ?', [uuid]);
  },
};

module.exports = Article;
