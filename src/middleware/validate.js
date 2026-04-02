const Joi = require('joi');

// Middleware factory: validates req.body against a Joi schema
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/"/g, ''),
        })),
      });
    }

    req.body = value;
    next();
  };
}

// Middleware factory: validates req.query
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/"/g, ''),
        })),
      });
    }

    req.query = value;
    next();
  };
}

// ========== Reusable Schemas ==========

const schemas = {
  // Auth
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refresh_token: Joi.string().required(),
  }),

  // Article creation (admin)
  createArticle: Joi.object({
    title: Joi.string().max(500).required(),
    subtitle: Joi.string().max(500).allow(null, ''),
    content: Joi.string().required(),
    summary: Joi.string().allow(null, ''),
    category_id: Joi.number().integer().required(),
    source_id: Joi.number().integer().required(),
    reporter_id: Joi.number().integer().allow(null),
    truth_score: Joi.number().min(0).max(100).default(0),
    is_featured: Joi.boolean().default(false),
    is_breaking: Joi.boolean().default(false),
    is_developing: Joi.boolean().default(false),
    is_live: Joi.boolean().default(false),
    is_morning_brief: Joi.boolean().default(false),
    tag_ids: Joi.array().items(Joi.number().integer()).default([]),
    region_ids: Joi.array().items(Joi.number().integer()).default([]),
  }),

  updateArticle: Joi.object({
    title: Joi.string().max(500),
    subtitle: Joi.string().max(500).allow(null, ''),
    content: Joi.string(),
    summary: Joi.string().allow(null, ''),
    category_id: Joi.number().integer(),
    source_id: Joi.number().integer(),
    reporter_id: Joi.number().integer().allow(null),
    truth_score: Joi.number().min(0).max(100),
    is_featured: Joi.boolean(),
    is_breaking: Joi.boolean(),
    is_developing: Joi.boolean(),
    is_live: Joi.boolean(),
    is_morning_brief: Joi.boolean(),
    tag_ids: Joi.array().items(Joi.number().integer()),
    region_ids: Joi.array().items(Joi.number().integer()),
  }),

  // Source
  createSource: Joi.object({
    name: Joi.string().max(200).required(),
    short_name: Joi.string().max(50).allow(null, ''),
    website_url: Joi.string().uri().allow(null, ''),
    description: Joi.string().allow(null, ''),
    trust_score: Joi.number().min(0).max(100).default(0),
    has_radio: Joi.boolean().default(false),
    has_newspaper: Joi.boolean().default(false),
  }),

  // Reporter
  createReporter: Joi.object({
    name: Joi.string().max(200).required(),
    title: Joi.string().max(200).allow(null, ''),
    bio: Joi.string().allow(null, ''),
    truth_score: Joi.number().min(0).max(100).default(0),
    is_verified: Joi.boolean().default(false),
    is_independent: Joi.boolean().default(false),
    source_id: Joi.number().integer().allow(null),
  }),

  // Radio stream
  createRadioStream: Joi.object({
    source_id: Joi.number().integer().required(),
    title: Joi.string().max(300).required(),
    description: Joi.string().allow(null, ''),
    stream_url: Joi.string().uri().required(),
    is_live: Joi.boolean().default(false),
    is_high_quality: Joi.boolean().default(false),
    display_order: Joi.number().integer().default(0),
  }),

  // Newspaper
  createNewspaper: Joi.object({
    source_id: Joi.number().integer().required(),
    title: Joi.string().max(300).required(),
    edition_date: Joi.date().required(),
  }),

  // Trending topic
  createTrendingTopic: Joi.object({
    title: Joi.string().max(300).required(),
    engagement_score: Joi.number().integer().default(0),
    engagement_label: Joi.string().max(100).allow(null, ''),
    region_id: Joi.number().integer().allow(null),
    article_ids: Joi.array().items(Joi.number().integer()).default([]),
  }),

  // World map insight
  createWorldMapInsight: Joi.object({
    title: Joi.string().max(300).required(),
    description: Joi.string().allow(null, ''),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    icon_type: Joi.string().max(50).allow(null, ''),
    article_id: Joi.number().integer().allow(null),
  }),

  // Compare coverage
  createCompareCoverage: Joi.object({
    topic_title: Joi.string().max(300).required(),
    items: Joi.array().items(
      Joi.object({
        source_id: Joi.number().integer().required(),
        headline: Joi.string().max(500).required(),
        stance_label: Joi.string().max(100).allow(null, ''),
        article_id: Joi.number().integer().allow(null),
      })
    ).min(2).required(),
  }),

  // Regional chart
  createRegionalChart: Joi.object({
    rank: Joi.number().integer().min(1).required(),
    title: Joi.string().max(300).required(),
    metric_label: Joi.string().max(200).allow(null, ''),
    region_id: Joi.number().integer().required(),
    article_id: Joi.number().integer().allow(null),
    chart_date: Joi.date().required(),
  }),

  // User preferences
  updatePreferences: Joi.object({
    preferred_categories: Joi.array().items(Joi.number().integer()).allow(null),
    preferred_regions: Joi.array().items(Joi.number().integer()).allow(null),
    preferred_sources: Joi.array().items(Joi.number().integer()).allow(null),
    notification_enabled: Joi.boolean(),
    high_quality_audio: Joi.boolean(),
  }),

  // User profile update
  updateProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(50),
  }),

  // Search query
  searchQuery: Joi.object({
    q: Joi.string().min(1).max(200).required(),
    scope: Joi.string().valid('national', 'global').default('global'),
    verified: Joi.boolean().default(false),
    category: Joi.string().allow(null, ''),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),

  // Pagination query
  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),
};

module.exports = { validate, validateQuery, schemas };
