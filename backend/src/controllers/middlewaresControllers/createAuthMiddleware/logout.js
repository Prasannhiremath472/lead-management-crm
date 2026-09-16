const pool = require('@/db/pool');

const logout = async (req, res) => {
  // const token = req.cookies[`token_${cloud._id}`];

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token

  if (token) await pool.query('DELETE FROM admin_sessions WHERE admin_id = ? AND token = ?', [req.admin.id, token]);
  else await pool.query('DELETE FROM admin_sessions WHERE admin_id = ?', [req.admin.id]);

  return res.json({
    success: true,
    result: {},
    message: 'Successfully logout',
  });
};

module.exports = logout;
