const path = require('path');

const isSupabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !isSupabaseConfigured) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in production.');
}

let db = null;
let supabase = null;

if (isSupabaseConfigured) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
} else {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'database.sqlite');

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database at:', dbPath);
      initTables();
    }
  });
}

function initTables() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      property_id TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      price TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.get('SELECT COUNT(*) AS count FROM properties', (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare('INSERT INTO properties (title, price, type, location, image) VALUES (?, ?, ?, ?, ?)');
        stmt.run('New Apartment Nice View', '$30,000/Month', 'Apartment', 'Belmont Gardens, Chicago', './assets/images/property-1.jpg');
        stmt.run('Modern Apartments', '$45,000/Month', 'Apartment', 'Rego Park, New York', './assets/images/property-2.jpg');
        stmt.run('Luxury villa in Rego Park', '$85,000/Month', 'Villa', 'Rego Park, New York', './assets/images/property-3.jpg');
        stmt.finalize();
      }
    });
  });
}

const sqliteAsync = {
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

const supabaseAsync = {
  addContact: async (name, email, subject, message) => {
    const { data, error } = await supabase.from('contacts')
      .insert({ name, email, subject, message }).select().single();
    if (error) throw error;
    return data;
  },
  getContacts: async () => {
    const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  addEnquiry: async (name, email, phone, property_id, message) => {
    const { data, error } = await supabase.from('enquiries')
      .insert({ name, email, phone, property_id, message }).select().single();
    if (error) throw error;
    return data;
  },
  getEnquiries: async () => {
    const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  getProperties: async () => {
    const { data, error } = await supabase.from('properties').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  },
  addProperty: async (title, price, type, location, image) => {
    const { data, error } = await supabase.from('properties')
      .insert({ title, price, type, location, image }).select().single();
    if (error) throw error;
    return data;
  }
};

const usersAsync = {
  getByEmail: async (email) => {
    const { data, error } = await supabase.from('users')
      .select('id, name, email, password_hash, role').eq('email', email).maybeSingle();
    if (error) throw error;
    return data;
  },
  getById: async (id) => {
    const { data, error } = await supabase.from('users')
      .select('id, name, email, password_hash, role').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  create: async ({ name, email, password_hash }) => {
    const { data, error } = await supabase.from('users')
      .insert({ name, email, password_hash, role: 'client' })
      .select('id, name, email, password_hash, role').single();
    if (error) throw error;
    return data;
  }
};

module.exports = {
  db,
  dbAsync: isSupabaseConfigured ? supabaseAsync : sqliteAsync,
  usersAsync,
  isSupabaseConfigured
};
