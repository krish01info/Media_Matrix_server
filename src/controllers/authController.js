const User = require('../models/User');
const { pool } = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function buildUsernameCandidates(email, name) {
  const localPart = String(email || '').split('@')[0] || 'user';
  const fromEmail = localPart.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const fromName = String(name || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const base = (fromName || fromEmail || 'user').slice(0, 24) || 'user';

  return [
    base,
    `${base}${Date.now().toString().slice(-4)}`,
    `${base}${Math.floor(1000 + Math.random() * 9000)}`,
  ];
}

async function createGoogleUser({ email, name, avatarUrl }) {
  const candidates = buildUsernameCandidates(email, name);
  let createdUser = null;

  for (const username of candidates) {
    try {
      createdUser = await User.create({
        username,
        email,
        password: `${Math.random().toString(36)}${Date.now().toString(36)}`,
      });
      break;
    } catch (err) {
      // PostgreSQL unique violation code
      if (err.code !== '23505') {
        throw err;
      }
    }
  }

  if (!createdUser) {
    throw new Error('Could not create user for Google account');
  }

  if (avatarUrl) {
    await User.updateProfile(createdUser.id, { avatar_url: avatarUrl });
  }

  await pool.query(
    'UPDATE users SET is_verified = true WHERE id = $1',
    [createdUser.id]
  );

  return User.findById(createdUser.id);
}

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
      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiresAt]
      );

      // Create default preferences
      await pool.query(
        'INSERT INTO user_preferences (user_id) VALUES ($1)',
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
      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
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

  // POST /api/auth/google
  async googleAuth(req, res, next) {
    try {
      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({
          success: false,
          message: 'GOOGLE_CLIENT_ID is not configured',
        });
      }

      const { id_token } = req.body;

      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(401).json({ success: false, message: 'Invalid Google token' });
      }

      const email = payload.email.toLowerCase();
      let user = await User.findByEmail(email);

      if (!user) {
        user = await createGoogleUser({
          email,
          name: payload.name,
          avatarUrl: payload.picture,
        });

        await pool.query(
          'INSERT INTO user_preferences (user_id) VALUES ($1)',
          [user.id]
        );
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiresAt]
      );

      res.json({
        success: true,
        message: 'Google login successful',
        data: {
          user: {
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url || payload.picture || null,
          },
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('token')) {
        return res.status(401).json({ success: false, message: 'Invalid Google token' });
      }
      next(err);
    }
  },

  // POST /api/auth/refresh
  async refresh(req, res, next) {
    try {
      const { refresh_token } = req.body;

      // Verify token exists in DB
      const { rows } = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
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
        await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refresh_token]);
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Rotate: delete old, create new
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refresh_token]);

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
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
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refresh_token]);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
