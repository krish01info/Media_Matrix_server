const RadioStream = require('../models/RadioStream');
const Podcast = require('../models/Podcast');
const Article = require('../models/Article');
const { cacheGet, cacheSet } = require('../config/redis');

const radioController = {
  // GET /api/radio/streams
  async streams(req, res, next) {
    try {
      const cacheKey = 'radio:streams';
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await RadioStream.getLive();
        await cacheSet(cacheKey, data, 60); // 1 min — live status changes
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/radio/streams/:id
  async streamDetail(req, res, next) {
    try {
      const data = await RadioStream.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Stream not found' });
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/radio/podcasts
  async podcasts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const cacheKey = `radio:podcasts:${page}`;
      let data = await cacheGet(cacheKey);
      if (!data) {
        data = await Podcast.getAll(page, limit);
        await cacheSet(cacheKey, data, 600);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/radio/latest-coverage
  async latestCoverage(req, res, next) {
    try {
      const cacheKey = 'radio:latest-coverage';
      let data = await cacheGet(cacheKey);
      if (!data) {
        // Get recent articles that have audio/radio source
        data = await Article.getTrending(10);
        await cacheSet(cacheKey, data, 300);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/radio/feed — combined
  async feed(req, res, next) {
    try {
      const cacheKey = 'radio:feed';
      let data = await cacheGet(cacheKey);
      if (!data) {
        const [streams, podcasts, latestCoverage] = await Promise.all([
          RadioStream.getLive(),
          Podcast.getAll(1, 10),
          Article.getTrending(6),
        ]);
        data = {
          streams,
          podcasts,
          latest_coverage: latestCoverage,
        };
        await cacheSet(cacheKey, data, 60);
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = radioController;
