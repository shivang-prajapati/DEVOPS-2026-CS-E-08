const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initTables();
  }
});

function initTables() {
  db.serialize(() => {
    // Contacts table
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Enquiries table
    db.run(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        property_id TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Properties table
    db.run(`
      CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price TEXT NOT NULL,
        type TEXT NOT NULL,
        location TEXT NOT NULL,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample initial properties if empty
    db.get('SELECT COUNT(*) AS count FROM properties', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare('INSERT INTO properties (title, price, type, location, image) VALUES (?, ?, ?, ?, ?)');
        stmt.run('New Apartment Nice View', '$30,000/Month', 'Apartment', 'Belmont Gardens, Chicago', './assets/images/property-1.jpg');
        stmt.run('Modern Apartments', '$45,000/Month', 'Apartment', 'Rego Park, New York', './assets/images/property-2.jpg');
        stmt.run('Luxury villa in Rego Park', '$85,000/Month', 'Villa', 'Rego Park, New York', './assets/images/property-3.jpg');
        stmt.finalize();
        console.log('Initial sample properties seeded.');
      }
    });
  });
}

// Helper methods
const dbAsync = {
  addContact: (name, email, subject, message) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)';
      db.run(sql, [name, email, subject, message], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, email, subject, message });
      });
    });
  },

  getContacts: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  addEnquiry: (name, email, phone, property_id, message) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO enquiries (name, email, phone, property_id, message) VALUES (?, ?, ?, ?, ?)';
      db.run(sql, [name, email, phone, property_id, message], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, email, phone, property_id, message });
      });
    });
  },

  getEnquiries: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM enquiries ORDER BY created_at DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getProperties: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM properties ORDER BY id ASC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  addProperty: (title, price, type, location, image) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO properties (title, price, type, location, image) VALUES (?, ?, ?, ?, ?)';
      db.run(sql, [title, price, type, location, image], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, title, price, type, location, image });
      });
    });
  }
};

module.exports = { db, dbAsync };
