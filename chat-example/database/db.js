const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const dbPath = path.resolve(__dirname, '../chat.db');
console.log('Opening SQLite at:', dbPath);

const db = new sqlite3.Database(dbPath, err => {
  if (err) console.error('sqlite connection error:', err);
  else console.log('Connected to DB');
});

module.exports = db;