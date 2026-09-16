const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const authUser = async (req, res, { user, databasePassword, password }) => {
  const isMatch = await bcrypt.compare(databasePassword.salt + password, databasePassword.password);

  if (!isMatch)
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Invalid credentials.',
    });

  if (isMatch === true) {
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: req.body.remember ? 365 * 24 + 'h' : '24h' }
    );

    await pool.query('INSERT INTO admin_sessions (admin_id, token) VALUES (?, ?)', [user.id, token]);

    // .cookie(`token_${user.cloud}`, token, {
    //     maxAge: req.body.remember ? 365 * 24 * 60 * 60 * 1000 : null,
    //     sameSite: 'None',
    //     httpOnly: true,
    //     secure: true,
    //     domain: req.hostname,
    //     path: '/',
    //     Partitioned: true,
    //   })
    res.status(200).json({
      success: true,
      result: withMongoIdShim({
        id: user.id,
        name: user.name,
        surname: user.surname,
        role: user.role,
        email: user.email,
        photo: user.photo,
        token: token,
        maxAge: req.body.remember ? 365 : null,
      }),
      message: 'Successfully login user',
    });
  } else {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Invalid credentials.',
    });
  }
};

module.exports = authUser;
