const { pool } = require('../config/db');

const Newspaper = {
  async getToday() {
    const { rows } = await pool.query(
      `SELECT n.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM newspapers n
       JOIN sources s ON n.source_id = s.id
       WHERE n.edition_date = CURRENT_DATE
       ORDER BY s.name ASC`
    );
    return rows;
  },

  async getByDate(date) {
    const { rows } = await pool.query(
      `SELECT n.*, s.name as source_name, s.short_name as source_short_name, s.logo_url as source_logo
       FROM newspapers n
       JOIN sources s ON n.source_id = s.id
       WHERE n.edition_date = $1
       ORDER BY s.name ASC`,
      [date]
    );
    return rows;
  },

  async create(data) {
    const { rows } = await pool.query(
      'INSERT INTO newspapers (source_id, title, cover_image_url, pdf_url, edition_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [data.source_id, data.title, data.cover_image_url, data.pdf_url || null, data.edition_date]
    );
    return { id: rows[0].id };
  },
};

module.exports = Newspaper;
