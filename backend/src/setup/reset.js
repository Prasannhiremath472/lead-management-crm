require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const pool = require('../db/pool');

async function deleteData() {
  await pool.query('DELETE FROM admin_sessions');
  await pool.query('DELETE FROM admin_passwords');
  await pool.query('DELETE FROM admins');
  console.log('👍 Admin Deleted. To setup demo admin data, run\n\n\t npm run setup\n\n');

  await pool.query('DELETE FROM settings');
  console.log('👍 Setting Deleted. To setup Setting data, run\n\n\t npm run setup\n\n');

  process.exit();
}

deleteData();
