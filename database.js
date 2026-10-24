const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'events.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Foreign Key dəstəyini aktivləşdiririk
  db.run("PRAGMA foreign_keys = ON");

  // 1. Categories Cədvəli
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  // 2. Events Cədvəli
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category_id INTEGER,
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL,
      location TEXT NOT NULL,
      max_capacity INTEGER NOT NULL CHECK(max_capacity > 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // 3. Users Cədvəli
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `);

  // 4. Registrations Cədvəli (Unikal təkrarlanma əleyhinə)
  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE(user_id, event_id)
    )
  `);

  // İlkin kateqoriyalar və sınaq istifadəçisi daxil edirik
  db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'Konfrans'), (2, 'Seminar'), (3, 'Təlim'), (4, 'Müsabiqə')`);
  db.run(`INSERT OR IGNORE INTO users (id, full_name, email) VALUES (1, 'Tələbə İstifadəçi', 'telebe@university.edu.az')`);
});

module.exports = db;