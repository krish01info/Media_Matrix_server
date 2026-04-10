const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Article = {
  // Create article
  async create(data) {
    const uuid = uuidv4();
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { rows } = await pool.query(
      `INSERT INTO articles (uuid, title, subtitle, slug, content, summary, image_url, thumbnail_url,
        category_id, source_id, reporter_id, truth_score, is_verified, is_featured, is_breaking,
        is_developing, is_live, is_morning_brief, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
       RETURNING id`,
      [uuid, data.title, data.subtitle || null, slug, data.content, data.summary || null,
       data.image_url || null, data.thumbnail_url || null, data.category_id, data.source_id,
       data.reporter_id || null, data.truth_score || 0, data.is_verified ? true : false,
       data.is_featured ? true : false, data.is_breaking ? true : false, data.is_developing ? true : false,
       data.is_live ? true : false, data.is_morning_brief ? true : false]
    );
    const articleId = rows[0].id;

    // Insert tags
    if (data.tag_ids && data.tag_ids.length > 0) {
      for (const tid of data.tag_ids) {
        await pool.query('INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)', [articleId, tid]);
      }
    }

    // Insert regions
    if (data.region_ids && data.region_ids.length > 0) {
      for (const rid of data.region_ids) {
        await pool.query('INSERT INTO article_regions (article_id, region_id) VALUES ($1, $2)', [articleId, rid]);
      }
    }

    return { id: articleId, uuid };
  },

  // Get article by UUID (full detail)
  async findByUuid(uuid) {
    const { rows } = await pool.query(
      `SELECT a.*, c.name as category_name, c.slug as category_slug,
              s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo,
              s.trust_score as source_trust_score,
              r.name as reporter_name, r.avatar_url as reporter_avatar, r.truth_score as reporter_truth_score
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       LEFT JOIN reporters r ON a.reporter_id = r.id
       WHERE a.uuid = $1`,
      [uuid]
    );
    if (!rows[0]) return null;

    // Get tags
    const tagResult = await pool.query(
      `SELECT t.id, t.name, t.slug FROM tags t
       JOIN article_tags at2 ON t.id = at2.tag_id
       WHERE at2.article_id = $1`,
      [rows[0].id]
    );

    // Get regions
    const regionResult = await pool.query(
      `SELECT r.id, r.name, r.slug FROM regions r
       JOIN article_regions ar ON r.id = ar.region_id
       WHERE ar.article_id = $1`,
      [rows[0].id]
    );

    return { ...rows[0], tags: tagResult.rows, regions: regionResult.rows };
  },

  // Featured articles
  async getFeatured(limit = 10) {
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.subtitle, a.image_url, a.thumbnail_url, a.truth_score,
              a.interaction_count, a.published_at,
              c.name as category_name, c.slug as category_slug,
              s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE a.is_featured = true
       ORDER BY a.published_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  // Trending articles (by interaction count)
  async getTrending(limit = 10) {
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.subtitle, a.image_url, a.thumbnail_url, a.truth_score,
              a.is_verified, a.interaction_count, a.published_at,
              c.name as category_name,
              s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo,
              s.trust_score as source_trust_score
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE a.published_at >= NOW() - INTERVAL '7 days'
       ORDER BY a.interaction_count DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  // Top Charts (ranked by interactions with formatted count)
  async getTopCharts(limit = 10) {
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.interaction_count, a.published_at, a.thumbnail_url,
              c.name as category_name
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       WHERE a.published_at >= NOW() - INTERVAL '30 days'
       ORDER BY a.interaction_count DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  // Morning Brief articles
  async getMorningBrief(limit = 10) {
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.summary, a.thumbnail_url, a.published_at,
              c.name as category_name, c.slug as category_slug,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE a.is_morning_brief = true
       ORDER BY a.published_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  // Developing Now
  async getDeveloping(limit = 10) {
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url, a.truth_score,
              a.is_live, a.published_at,
              c.name as category_name,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE a.is_developing = true
       ORDER BY a.published_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  // Breaking / Live updates (Global Affairs Highlights)
  async getHighlights(limit = 5) {
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.subtitle, a.image_url, a.thumbnail_url, a.is_live,
              a.is_breaking, a.truth_score, a.published_at,
              c.name as category_name,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE (a.is_breaking = true OR a.is_live = true)
         AND a.category_id = (SELECT id FROM categories WHERE slug = 'global-affairs')
       ORDER BY a.published_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  // Articles by category
  async getByCategory(categorySlug, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.interaction_count, a.published_at,
              c.name as category_name,
              s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE c.slug = $1
       ORDER BY a.published_at DESC
       LIMIT $2 OFFSET $3`,
      [categorySlug, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM articles a JOIN categories c ON a.category_id = c.id WHERE c.slug = $1',
      [categorySlug]
    );

    return { articles: rows, total: parseInt(countResult.rows[0].total), page, limit };
  },

  // Articles by source
  async getBySource(sourceSlug, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.interaction_count, a.published_at,
              c.name as category_name,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       WHERE s.slug = $1
       ORDER BY a.published_at DESC
       LIMIT $2 OFFSET $3`,
      [sourceSlug, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM articles a JOIN sources s ON a.source_id = s.id WHERE s.slug = $1',
      [sourceSlug]
    );

    return { articles: rows, total: parseInt(countResult.rows[0].total), page, limit };
  },

  // Articles by reporter
  async getByReporter(reporterSlug, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.published_at,
              c.name as category_name,
              s.name as source_name,
              r.name as reporter_name, r.avatar_url as reporter_avatar
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       JOIN reporters r ON a.reporter_id = r.id
       WHERE r.slug = $1
       ORDER BY a.published_at DESC
       LIMIT $2 OFFSET $3`,
      [reporterSlug, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM articles a JOIN reporters r ON a.reporter_id = r.id WHERE r.slug = $1',
      [reporterSlug]
    );

    return { articles: rows, total: parseInt(countResult.rows[0].total), page, limit };
  },

  // Articles by region
  async getByRegion(regionSlug, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.interaction_count, a.published_at,
              c.name as category_name,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       JOIN article_regions ar ON a.id = ar.article_id
       JOIN regions reg ON ar.region_id = reg.id
       WHERE reg.slug = $1
       ORDER BY a.published_at DESC
       LIMIT $2 OFFSET $3`,
      [regionSlug, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM articles a
       JOIN article_regions ar ON a.id = ar.article_id
       JOIN regions reg ON ar.region_id = reg.id WHERE reg.slug = $1`,
      [regionSlug]
    );

    return { articles: rows, total: parseInt(countResult.rows[0].total), page, limit };
  },

  // Articles by tag
  async getByTag(tagSlug, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.published_at,
              c.name as category_name,
              s.name as source_name
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       JOIN article_tags at2 ON a.id = at2.article_id
       JOIN tags t ON at2.tag_id = t.id
       WHERE t.slug = $1
       ORDER BY a.published_at DESC
       LIMIT $2 OFFSET $3`,
      [tagSlug, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM articles a
       JOIN article_tags at2 ON a.id = at2.article_id
       JOIN tags t ON at2.tag_id = t.id WHERE t.slug = $1`,
      [tagSlug]
    );

    return { articles: rows, total: parseInt(countResult.rows[0].total), page, limit };
  },

  // Full-text search
  async search({ q, scope, verified, category, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let where = `WHERE (a.title ILIKE $1 OR a.content ILIKE $1 OR a.summary ILIKE $1)`;
    const searchPattern = `%${q}%`;
    const params = [searchPattern];
    let paramIndex = 2;

    if (verified) {
      where += ' AND a.is_verified = true';
    }
    if (category) {
      where += ` AND c.slug = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    params.push(limit);
    params.push(offset);

    const { rows } = await pool.query(
      `SELECT a.uuid, a.title, a.subtitle, a.summary, a.image_url, a.thumbnail_url,
              a.truth_score, a.is_verified, a.published_at,
              c.name as category_name, c.slug as category_slug,
              s.name as source_name, s.logo_url as source_logo
       FROM articles a
       JOIN categories c ON a.category_id = c.id
       JOIN sources s ON a.source_id = s.id
       ${where}
       ORDER BY a.published_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return { articles: rows, page, limit };
  },

  // Update article
  async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    const allowedFields = ['title', 'subtitle', 'content', 'summary', 'image_url', 'thumbnail_url',
      'category_id', 'source_id', 'reporter_id', 'truth_score', 'is_verified', 'is_featured',
      'is_breaking', 'is_developing', 'is_live', 'is_morning_brief'];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push(data[field]);
      }
    }

    if (data.title) {
      fields.push(`slug = $${paramIndex++}`);
      values.push(data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE articles SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
    }

    // Update tags
    if (data.tag_ids) {
      await pool.query('DELETE FROM article_tags WHERE article_id = $1', [id]);
      if (data.tag_ids.length > 0) {
        for (const tid of data.tag_ids) {
          await pool.query('INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)', [id, tid]);
        }
      }
    }

    // Update regions
    if (data.region_ids) {
      await pool.query('DELETE FROM article_regions WHERE article_id = $1', [id]);
      if (data.region_ids.length > 0) {
        for (const rid of data.region_ids) {
          await pool.query('INSERT INTO article_regions (article_id, region_id) VALUES ($1, $2)', [id, rid]);
        }
      }
    }

    return this.findById(id);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async delete(id) {
    await pool.query('DELETE FROM articles WHERE id = $1', [id]);
  },

  // Increment view count
  async incrementView(uuid) {
    await pool.query('UPDATE articles SET view_count = view_count + 1 WHERE uuid = $1', [uuid]);
  },
};

module.exports = Article;
