const db = require('../../database');

class RegistrationController {
  registerUser(req, res, next) {
    const { user_id, event_id } = req.body;

    if (!user_id || !event_id) {
      return res.status(400).json({ error: 'User ID və Event ID tələb olunur.' });
    }

    // 1. Tədbirin mövcudluğunu və limitini yoxla
    db.get(
      `SELECT max_capacity,
       (SELECT COUNT(*) FROM registrations WHERE event_id = ?) as current_registrations
       FROM events WHERE id = ?`,
      [event_id, event_id],
      (err, event) => {
        if (err) return next(err);
        if (!event) return res.status(404).json({ error: 'Tədbir tapılmadı.' });

        if (event.current_registrations >= event.max_capacity) {
          return res.status(400).json({ error: 'Tədbirin iştirakçı limiti dolub!' });
        }

        // 2. Qeydiyyatı icra et
        const sql = `INSERT INTO registrations (user_id, event_id) VALUES (?, ?)`;
        db.run(sql, [user_id, event_id], function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ error: 'Siz artıq bu tədbirə qeydiyyatdan keçmisiniz.' });
            }
            return next(err);
          }
          res.status(201).json({ status: 'success', message: 'Qeydiyyat tamamlandı', registration_id: this.lastID });
        });
      }
    );
  }

  cancelRegistration(req, res, next) {
    const { user_id, event_id } = req.body;
    db.run(`DELETE FROM registrations WHERE user_id = ? AND event_id = ?`, [user_id, event_id], function(err) {
      if (err) return next(err);
      if (this.changes === 0) return res.status(404).json({ error: 'Qeydiyyat tapılmadı.' });
      res.json({ status: 'success', message: 'Qeydiyyat ləğv edildi.' });
    });
  }
}

module.exports = new RegistrationController();