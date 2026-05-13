const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(schema);
    console.log('Database initialized');
  } catch (err) {
    console.error('Database init error:', err.message);
  }
}

module.exports = initDb;
