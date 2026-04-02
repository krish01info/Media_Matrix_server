const Article = require('../models/Article');
const RegionalChart = require('../models/RegionalChart');
const { cacheGet, cacheSet } = require('../config/redis');

const todayController = {
  // GET /api/today/morning-brief
  async morningBrief(req, res, next) {
    try {
      const cacheKey = 'today:morning-brief';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getMorningBrief(10);
        await cacheSet(cacheKey, data, 300);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/today/developing
  async developing(req, res, next) {
    try {
      const cacheKey = 'today:developing';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getDeveloping(10);
        await cacheSet(cacheKey, data, 60); // 1 min — fast-changing
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/today/trending
  async trending(req, res, next) {
    try {
      const cacheKey = 'today:trending';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getTrending(10);
        await cacheSet(cacheKey, data, 180);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/today/regional-charts?region=americas
  async regionalCharts(req, res, next) {
    try {
      const region = req.query.region || 'americas';
      const cacheKey = `today:regional-charts:${region}`;
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await RegionalChart.getByRegion(region);
        await cacheSet(cacheKey, data, 600);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/today/feed — combined
  async feed(req, res, next) {
    try {
      const cacheKey = 'today:feed';
      let data = await cacheGet(cacheKey);
      if (!data) {
        const [morningBrief, developing, trending, regionalCharts] = await Promise.all([
          Article.getMorningBrief(8),
          Article.getDeveloping(5),
          Article.getTrending(6),
          RegionalChart.getAll(),
        ]);
        data = {
          morning_brief: morningBrief,
          developing,
          trending,
          regional_charts: regionalCharts,
        };
        await cacheSet(cacheKey, data, 60);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = todayController;
