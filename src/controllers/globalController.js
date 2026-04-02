const Article = require('../models/Article');
const WorldMapInsight = require('../models/WorldMapInsight');
const TrendingTopic = require('../models/TrendingTopic');
const CompareCoverage = require('../models/CompareCoverage');
const Reporter = require('../models/Reporter');
const { cacheGet, cacheSet } = require('../config/redis');

const globalController = {
  // GET /api/global/highlights
  async highlights(req, res, next) {
    try {
      const cacheKey = 'global:highlights';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getHighlights(5);
        await cacheSet(cacheKey, data, 120);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/global/map-insights
  async mapInsights(req, res, next) {
    try {
      const cacheKey = 'global:map-insights';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await WorldMapInsight.getActive();
        await cacheSet(cacheKey, data, 600);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/global/regional-pulse?region=americas
  async regionalPulse(req, res, next) {
    try {
      const region = req.query.region || 'americas';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const cacheKey = `global:regional-pulse:${region}:${page}`;
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Article.getByRegion(region, page, limit);
        await cacheSet(cacheKey, data, 300);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/global/trending-topics
  async trendingTopics(req, res, next) {
    try {
      const cacheKey = 'global:trending-topics';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await TrendingTopic.getActive(10);
        await cacheSet(cacheKey, data, 300);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/global/compare-coverage
  async compareCoverage(req, res, next) {
    try {
      const cacheKey = 'global:compare-coverage';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await CompareCoverage.getActive();
        await cacheSet(cacheKey, data, 600);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/global/independent-voices
  async independentVoices(req, res, next) {
    try {
      const cacheKey = 'global:independent-voices';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Reporter.getIndependentVoices(10);
        await cacheSet(cacheKey, data, 600);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/global/feed — combined
  async feed(req, res, next) {
    try {
      const cacheKey = 'global:feed';
      let data = await cacheGet(cacheKey);
      if (!data) {
        const [highlights, mapInsights, trendingTopics, compareCoverage, independentVoices] =
          await Promise.all([
            Article.getHighlights(3),
            WorldMapInsight.getActive(),
            TrendingTopic.getActive(5),
            CompareCoverage.getActive(),
            Reporter.getIndependentVoices(5),
          ]);
        data = {
          highlights,
          map_insights: mapInsights,
          trending_topics: trendingTopics,
          compare_coverage: compareCoverage,
          independent_voices: independentVoices,
        };
        await cacheSet(cacheKey, data, 120);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = globalController;
