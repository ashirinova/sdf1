const express = require('express');
const router = express.Router();
const db = require('../../database');

router.get('/', (req, res, next) => {
  const stats = {};
  db.get(`SELECT COUNT(*) as total_events FROM events`, [], (err, row) => {
    if (err) return next(err);
    stats.total_events = row.total_events;

    db.get(`SELECT COUNT(*) as total_registrations FROM registrations`, [], (err, row) => {
      if (err) return next(err);
      stats.total_registrations = row.total_registrations;

      db.all(`
        SELECT e.title, COUNT(r.id) as reg_count
        FROM events e LEFT JOIN registrations r ON e.id = r.event_id
        GROUP BY e.id ORDER BY reg_count DESC LIMIT 3
      `, [], (err, rows) => {
        if (err) return next(err);
        stats.top_events = rows;
        res.json({ status: 'success', data: stats });
      });
    });
  });
});

module.exports = router;