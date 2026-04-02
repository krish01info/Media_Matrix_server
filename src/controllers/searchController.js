const Article = require('../models/Article');
const Category = require('../models/Category');
const Reporter = require('../models/Reporter');
const { cacheGet, cacheSet } = require('../config/redis');

const searchController = {
  // GET /api/search?q=...&scope=global&verified=true&category=economy&page=1&limit=20
  async search(req, res, next) {
    try {
      const { q, scope, verified, category, page, limit } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }

      const data = await Article.search({
        q: q.trim(),
        scope,
        verified: verified === 'true' || verified === '1',
        category,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/search/categories
  async categories(req, res, next) {
    try {
      const cacheKey = 'search:categories';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Category.getAll();
        await cacheSet(cacheKey, data, 3600); // 1 hour
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/search/reporters?verified=true
  async reporters(req, res, next) {
    try {
      const verified = req.query.verified === 'true' || req.query.verified === '1';
      const independent = req.query.independent === 'true' || req.query.independent === '1';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const cacheKey = `search:reporters:v${verified}:i${independent}:p${page}`;
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Reporter.getAll({ verified, independent, page, limit });
        await cacheSet(cacheKey, data, 600);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = searchController;
