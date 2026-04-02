const Article = require('../models/Article');
const Source = require('../models/Source');
const Reporter = require('../models/Reporter');
const RadioStream = require('../models/RadioStream');
const Newspaper = require('../models/Newspaper');
const TrendingTopic = require('../models/TrendingTopic');
const WorldMapInsight = require('../models/WorldMapInsight');
const CompareCoverage = require('../models/CompareCoverage');
const RegionalChart = require('../models/RegionalChart');
const { uploadImage, uploadThumbnail } = require('../config/cloudinary');
const { cacheDel } = require('../config/redis');

const adminController = {
  // ==================== Articles ====================

  // POST /api/admin/articles
  async createArticle(req, res, next) {
    try {
      let image_url = null;
      let thumbnail_url = null;

      if (req.file) {
        const [imgResult, thumbResult] = await Promise.all([
          uploadImage(req.file.buffer, 'media_matrix/articles'),
          uploadThumbnail(req.file.buffer, 'media_matrix/articles/thumbs'),
        ]);
        image_url = imgResult.secure_url;
        thumbnail_url = thumbResult.secure_url;
      }

      const article = await Article.create({
        ...req.body,
        image_url,
        thumbnail_url,
      });

      // Invalidate caches
      await cacheDel('home:*');
      await cacheDel('today:*');

      res.status(201).json({ success: true, data: article, message: 'Article created successfully' });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/admin/articles/:id
  async updateArticle(req, res, next) {
    try {
      let updateData = { ...req.body };

      if (req.file) {
        const [imgResult, thumbResult] = await Promise.all([
          uploadImage(req.file.buffer, 'media_matrix/articles'),
          uploadThumbnail(req.file.buffer, 'media_matrix/articles/thumbs'),
        ]);
        updateData.image_url = imgResult.secure_url;
        updateData.thumbnail_url = thumbResult.secure_url;
      }

      const article = await Article.update(parseInt(req.params.id), updateData);

      // Invalidate caches
      await cacheDel('home:*');
      await cacheDel('today:*');
      await cacheDel('article:*');

      res.json({ success: true, data: article, message: 'Article updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/admin/articles/:id
  async deleteArticle(req, res, next) {
    try {
      await Article.delete(parseInt(req.params.id));
      await cacheDel('home:*');
      await cacheDel('today:*');
      await cacheDel('article:*');
      res.json({ success: true, message: 'Article deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  // ==================== Sources ====================

  // POST /api/admin/sources
  async createSource(req, res, next) {
    try {
      let logo_url = null;
      if (req.file) {
        const result = await uploadImage(req.file.buffer, 'media_matrix/sources');
        logo_url = result.secure_url;
      }

      const source = await Source.create({ ...req.body, logo_url });
      res.status(201).json({ success: true, data: source, message: 'Source created successfully' });
    } catch (err) {
      next(err);
    }
  },

  // ==================== Reporters ====================

  // POST /api/admin/reporters
  async createReporter(req, res, next) {
    try {
      let avatar_url = null;
      if (req.file) {
        const result = await uploadImage(req.file.buffer, 'media_matrix/reporters');
        avatar_url = result.secure_url;
      }

      const reporter = await Reporter.create({ ...req.body, avatar_url });
      await cacheDel('global:independent-voices');
      await cacheDel('search:reporters:*');
      res.status(201).json({ success: true, data: reporter, message: 'Reporter created successfully' });
    } catch (err) {
      next(err);
    }
  },

  // ==================== Radio Streams ====================

  // POST /api/admin/radio-streams
  async createRadioStream(req, res, next) {
    try {
      let thumbnail_url = null;
      if (req.file) {
        const result = await uploadImage(req.file.buffer, 'media_matrix/radio');
        thumbnail_url = result.secure_url;
      }

      const stream = await RadioStream.create({ ...req.body, thumbnail_url });
      await cacheDel('radio:*');
      res.status(201).json({ success: true, data: stream, message: 'Radio stream created successfully' });
    } catch (err) {
      next(err);
    }
  },

  // ==================== Newspapers ====================

  // POST /api/admin/newspapers
  async createNewspaper(req, res, next) {
    try {
      let cover_image_url = null;
      if (req.file) {
        const result = await uploadImage(req.file.buffer, 'media_matrix/newspapers');
        cover_image_url = result.secure_url;
      }

      const newspaper = await Newspaper.create({ ...req.body, cover_image_url });
      await cacheDel('home:newspapers');
      await cacheDel('home:feed');
      res.status(201).json({ success: true, data: newspaper, message: 'Newspaper created successfully' });
    } catch (err) {
      next(err);
    }
  },

  // ==================== Trending Topics ====================

  // POST /api/admin/trending-topics
  async createTrendingTopic(req, res, next) {
    try {
      const topic = await TrendingTopic.create(req.body);
      await cacheDel('global:trending-topics');
      await cacheDel('global:feed');
      res.status(201).json({ success: true, data: topic, message: 'Trending topic created successfully' });
    } catch (err) {
      next(err);
    }
  },

  // ==================== World Map Insights ====================

  // POST /api/admin/world-map-insights
  async createWorldMapInsight(req, res, next) {
    try {
      const insight = await WorldMapInsight.create(req.body);
      await cacheDel('global:map-insights');
      await cacheDel('global:feed');
      res.status(201).json({ success: true, data: insight, message: 'Map insight created successfully' });
    } catch (err) {
      next(err);
    }
  },

  // ==================== Compare Coverage ====================

  // POST /api/admin/compare-coverage
  async createCompareCoverage(req, res, next) {
    try {
      const coverage = await CompareCoverage.create(req.body);
      await cacheDel('global:compare-coverage');
      await cacheDel('global:feed');
      res.status(201).json({ success: true, data: coverage, message: 'Compare coverage created successfully' });
    } catch (err) {
      next(err);
    }
  },

  // ==================== Regional Charts ====================

  // POST /api/admin/regional-charts
  async createRegionalChart(req, res, next) {
    try {
      const chart = await RegionalChart.create(req.body);
      await cacheDel('today:regional-charts:*');
      await cacheDel('today:feed');
      res.status(201).json({ success: true, data: chart, message: 'Regional chart entry created successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = adminController;
