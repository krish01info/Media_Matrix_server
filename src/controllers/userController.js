const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const ReadingHistory = require('../models/ReadingHistory');
const { pool } = require('../config/db');
const { uploadImage } = require('../config/cloudinary');

const userController = {
  // GET /api/user/profile
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Get preferences
      const { rows: prefRows } = await pool.query(
        'SELECT * FROM user_preferences WHERE user_id = $1', [req.user.id]
      );

      res.json({
        success: true,
        data: {
          ...user,
          preferences: prefRows[0] || null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/user/profile
  async updateProfile(req, res, next) {
    try {
      let avatar_url = undefined;

      // Handle avatar upload via Cloudinary
      if (req.file) {
        const result = await uploadImage(req.file.buffer, 'media_matrix/avatars');
        avatar_url = result.secure_url;
      }

      const user = await User.updateProfile(req.user.id, {
        username: req.body.username,
        avatar_url,
      });

      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/user/bookmarks
  async getBookmarks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const data = await Bookmark.getByUser(req.user.id, page, limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/user/bookmarks/:articleUuid
  async addBookmark(req, res, next) {
    try {
      await Bookmark.add(req.user.id, req.params.articleUuid);
      res.status(201).json({ success: true, message: 'Article bookmarked' });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/user/bookmarks/:articleUuid
  async removeBookmark(req, res, next) {
    try {
      await Bookmark.remove(req.user.id, req.params.articleUuid);
      res.json({ success: true, message: 'Bookmark removed' });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/user/history
  async getHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const data = await ReadingHistory.getByUser(req.user.id, page, limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/user/history
  async recordRead(req, res, next) {
    try {
      const { article_uuid, duration_sec } = req.body;
      await ReadingHistory.record(req.user.id, article_uuid, duration_sec || null);
      res.status(201).json({ success: true, message: 'Reading recorded' });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/user/preferences
  async getPreferences(req, res, next) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM user_preferences WHERE user_id = $1', [req.user.id]
      );
      res.json({ success: true, data: rows[0] || null });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/user/preferences
  async updatePreferences(req, res, next) {
    try {
      const { preferred_categories, preferred_regions, preferred_sources,
              notification_enabled, high_quality_audio } = req.body;

      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (preferred_categories !== undefined) {
        fields.push(`preferred_categories = $${paramIndex++}`);
        values.push(JSON.stringify(preferred_categories));
      }
      if (preferred_regions !== undefined) {
        fields.push(`preferred_regions = $${paramIndex++}`);
        values.push(JSON.stringify(preferred_regions));
      }
      if (preferred_sources !== undefined) {
        fields.push(`preferred_sources = $${paramIndex++}`);
        values.push(JSON.stringify(preferred_sources));
      }
      if (notification_enabled !== undefined) {
        fields.push(`notification_enabled = $${paramIndex++}`);
        values.push(notification_enabled ? true : false);
      }
      if (high_quality_audio !== undefined) {
        fields.push(`high_quality_audio = $${paramIndex++}`);
        values.push(high_quality_audio ? true : false);
      }

      if (fields.length > 0) {
        values.push(req.user.id);
        await pool.query(
          `UPDATE user_preferences SET ${fields.join(', ')} WHERE user_id = $${paramIndex}`,
          values
        );
      }

      const { rows } = await pool.query(
        'SELECT * FROM user_preferences WHERE user_id = $1', [req.user.id]
      );

      res.json({ success: true, data: rows[0] });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = userController;
