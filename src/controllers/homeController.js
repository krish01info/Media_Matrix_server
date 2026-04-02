const Article = require('../models/Article');
const Newspaper = require('../models/Newspaper');
const { cacheGet, cacheSet } = require('../config/redis');

const homeController = {
  // GET /api/home/featured
  async featured(req, res, next) {
    try {
      const cacheKey = 'home:featured';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getFeatured(10);
        await cacheSet(cacheKey, data, 300); // 5 min cache
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/home/trending
  async trending(req, res, next) {
    try {
      const cacheKey = 'home:trending';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getTrending(10);
        await cacheSet(cacheKey, data, 180); // 3 min cache
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/home/top-charts
  async topCharts(req, res, next) {
    try {
      const cacheKey = 'home:top-charts';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getTopCharts(10);
        await cacheSet(cacheKey, data, 600); // 10 min cache
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/home/newspapers
  async newspapers(req, res, next) {
    try {
      const cacheKey = 'home:newspapers';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Newspaper.getToday();
        await cacheSet(cacheKey, data, 3600); // 1 hour cache
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/home/feed — combined home screen data
  async feed(req, res, next) {
    try {
      const cacheKey = 'home:feed';
      let data = await cacheGet(cacheKey);
      if (!data) {
        const [featured, trending, topCharts, newspapers] = await Promise.all([
          Article.getFeatured(6),
          Article.getTrending(10),
          Article.getTopCharts(5),
          Newspaper.getToday(),
        ]);
        data = { featured, trending, top_charts: topCharts, newspapers };
        await cacheSet(cacheKey, data, 120); // 2 min cache
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = homeController;
