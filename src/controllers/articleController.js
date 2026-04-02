const Article = require('../models/Article');
const { cacheGet, cacheSet } = require('../config/redis');

const articleController = {
  // GET /api/articles/:uuid
  async getByUuid(req, res, next) {
    try {
      const { uuid } = req.params;
      const cacheKey = `article:${uuid}`;
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.findByUuid(uuid);
        if (!data) {
          return res.status(404).json({ success: false, message: 'Article not found' });
        }
        await cacheSet(cacheKey, data, 600);
      }

      // Increment view count asynchronously
      Article.incrementView(uuid).catch(() => {});

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/articles/by-category/:slug
  async byCategory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const cacheKey = `articles:cat:${req.params.slug}:p${page}`;
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getByCategory(req.params.slug, page, limit);
        await cacheSet(cacheKey, data, 300);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/articles/by-source/:slug
  async bySource(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const cacheKey = `articles:src:${req.params.slug}:p${page}`;
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getBySource(req.params.slug, page, limit);
        await cacheSet(cacheKey, data, 300);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/articles/by-reporter/:slug
  async byReporter(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const cacheKey = `articles:rep:${req.params.slug}:p${page}`;
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getByReporter(req.params.slug, page, limit);
        await cacheSet(cacheKey, data, 300);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/articles/by-region/:slug
  async byRegion(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const cacheKey = `articles:reg:${req.params.slug}:p${page}`;
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getByRegion(req.params.slug, page, limit);
        await cacheSet(cacheKey, data, 300);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/articles/by-tag/:slug
  async byTag(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const cacheKey = `articles:tag:${req.params.slug}:p${page}`;
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getByTag(req.params.slug, page, limit);
        await cacheSet(cacheKey, data, 300);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = articleController;
