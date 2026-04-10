const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const User = {
  async create({ username, email, password }) {
    const uuid = uuidv4();
    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO users (uuid, username, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [uuid, username, email, password_hash]
    );
    return { id: rows[0].id, uuid, username, email };
  },

  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, uuid, username, email, avatar_url, is_verified, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async findByUuid(uuid) {
    const { rows } = await pool.query(
      'SELECT id, uuid, username, email, avatar_url, is_verified, created_at FROM users WHERE uuid = $1',
      [uuid]
    );
    return rows[0] || null;
  },

  async updateProfile(id, { username, avatar_url }) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    if (username) { fields.push(`username = $${paramIndex++}`); values.push(username); }
    if (avatar_url) { fields.push(`avatar_url = $${paramIndex++}`); values.push(avatar_url); }
    if (fields.length === 0) return null;
    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
    return this.findById(id);
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};

module.exports = User;
