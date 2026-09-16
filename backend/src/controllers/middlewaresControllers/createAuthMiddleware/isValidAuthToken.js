const jwt = require('jsonwebtoken');

const pool = require('@/db/pool');

const isValidAuthToken = async (req, res, next, jwtSecret = 'JWT_SECRET') => {
  try {
    // const token = req.cookies[`token_${cloud._id}`];
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token

    if (!token)
      return res.status(401).json({
        success: false,
        result: null,
        message: 'No authentication token, authorization denied.',
        jwtExpired: true,
      });

    const verified = jwt.verify(token, process.env[jwtSecret]);

    if (!verified)
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Token verification failed, authorization denied.',
        jwtExpired: true,
      });

    const userPasswordPromise = pool.query(
      'SELECT * FROM admin_passwords WHERE admin_id = ? AND removed = 0',
      [verified.id]
    );
    const userPromise = pool.query('SELECT * FROM admins WHERE id = ? AND removed = 0', [verified.id]);

    const [[userPasswordRows], [userRows]] = await Promise.all([userPasswordPromise, userPromise]);
    const userPassword = userPasswordRows[0];
    const user = userRows[0];

    if (!user)
      return res.status(401).json({
        success: false,
        result: null,
        message: "User doens't Exist, authorization denied.",
        jwtExpired: true,
      });

    const [sessionRows] = await pool.query(
      'SELECT 1 FROM admin_sessions WHERE admin_id = ? AND token = ? LIMIT 1',
      [verified.id, token]
    );

    if (sessionRows.length === 0)
      return res.status(401).json({
        success: false,
        result: null,
        message: 'User is already logout try to login, authorization denied.',
        jwtExpired: true,
      });
    else {
      req.admin = user;
      next();
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
      controller: 'isValidAuthToken',
      jwtExpired: true,
    });
  }
};

module.exports = isValidAuthToken;
