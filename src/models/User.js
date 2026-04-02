const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const User = {
  async create({ username, email, password }) {
    const uuid = uuidv4();
    const password_hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (uuid, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [uuid, username, email, password_hash]
    );
    return { id: result.insertId, uuid, username, email };
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, uuid, username, email, avatar_url, is_verified, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByUuid(uuid) {
    const [rows] = await pool.execute(
      'SELECT id, uuid, username, email, avatar_url, is_verified, created_at FROM users WHERE uuid = ?',
      [uuid]
    );
    return rows[0] || null;
  },

  async updateProfile(id, { username, avatar_url }) {
    const fields = [];
    const values = [];
    if (username) { fields.push('username = ?'); values.push(username); }
    if (avatar_url) { fields.push('avatar_url = ?'); values.push(avatar_url); }
    if (fields.length === 0) return null;
    values.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};

module.exports = User;
