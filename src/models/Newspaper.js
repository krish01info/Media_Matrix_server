const { pool } = require('../config/db');

const Newspaper = {
  async getToday() {
    const [rows] = await pool.execute(
      `SELECT n.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM newspapers n
       JOIN sources s ON n.source_id = s.id
       WHERE n.edition_date = CURDATE()
       ORDER BY s.name ASC`
    );
    return rows;
  },

  async getByDate(date) {
    const [rows] = await pool.execute(
      `SELECT n.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM newspapers n
       JOIN sources s ON n.source_id = s.id
       WHERE n.edition_date = ?
       ORDER BY s.name ASC`,
      [date]
    );
    return rows;
  },

  async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO newspapers (source_id, title, cover_image_url, pdf_url, edition_date) VALUES (?, ?, ?, ?, ?)',
      [data.source_id, data.title, data.cover_image_url, data.pdf_url || null, data.edition_date]
    );
    return { id: result.insertId };
  },
};

module.exports = Newspaper;
