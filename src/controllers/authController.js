const User = require('../models/User');
const { pool } = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const authController = {
  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      // Check if user exists
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({ username, email, password });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await pool.execute(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, refreshToken, expiresAt]
      );

      // Create default preferences
      await pool.execute(
        'INSERT INTO user_preferences (user_id) VALUES (?)',
        [user.id]
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: { uuid: user.uuid, username: user.username, email: user.email },
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await User.comparePassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await pool.execute(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, refreshToken, expiresAt]
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
          },
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/refresh
  async refresh(req, res, next) {
    try {
      const { refresh_token } = req.body;

      // Verify token exists in DB
      const [rows] = await pool.execute(
        'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
        [refresh_token]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      // Verify JWT
      let decoded;
      try {
        decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
      } catch (err) {
        // Remove invalid token
        await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refresh_token]);
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Rotate: delete old, create new
      await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refresh_token]);

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await pool.execute(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, newRefreshToken, expiresAt]
      );

      res.json({
        success: true,
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/logout
  async logout(req, res, next) {
    try {
      const { refresh_token } = req.body;
      await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refresh_token]);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
