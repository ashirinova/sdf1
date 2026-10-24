const db = require('../../database');

class EventController {
  // Bütün tədbirləri filter/search ilə gətirir
  getAllEvents(req, res, next) {
    const { search, category, location } = req.query;
    let query = `
      SELECT e.*, c.name as category_name,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registered_count
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND e.title LIKE ?`;
      params.push(`%${search}%`);
    }
    if (category) {
      query += ` AND e.category_id = ?`;
      params.push(category);
    }
    if (location) {
      query += ` AND e.location LIKE ?`;
      params.push(`%${location}%`);
    }

    query += ` ORDER BY e.event_date ASC`;

    db.all(query, params, (err, rows) => {
      if (err) return next(err);
      res.json({ status: 'success', data: rows });
    });
  }

  // Yeni tədbir yaradır
  createEvent(req, res, next) {
    const { title, description, category_id, event_date, event_time, location, max_capacity } = req.body;

    if (!title || !event_date || !event_time || !location || !max_capacity) {
      return res.status(400).json({ error: 'Məcburi sahələri doldurun.' });
    }

    const sql = `INSERT INTO events (title, description, category_id, event_date, event_time, location, max_capacity)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [title, description, category_id, event_date, event_time, location, max_capacity], function(err) {
      if (err) return next(err);
      res.status(201).json({ status: 'success', id: this.lastID });
    });
  }

  // Tədbiri silir
  deleteEvent(req, res, next) {
    const { id } = req.params;
    db.run(`DELETE FROM events WHERE id = ?`, [id], function(err) {
      if (err) return next(err);
      if (this.changes === 0) return res.status(404).json({ error: 'Tədbir tapılmadı' });
      res.json({ status: 'success', message: 'Tədbir silindi' });
    });
  }
}

module.exports = new EventController();