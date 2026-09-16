const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const shortid = require('shortid');

const resetPassword = async (req, res) => {
  const { password, userId, resetToken } = req.body;

  const [passwordRows] = await pool.query(
    'SELECT * FROM admin_passwords WHERE admin_id = ? AND removed = 0',
    [userId]
  );
  const databasePassword = passwordRows[0];

  const [userRows] = await pool.query('SELECT * FROM admins WHERE id = ? AND removed = 0', [userId]);
  const user = userRows[0];

  if (!user.enabled)
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    });

  if (!databasePassword || !user)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  const isMatch = resetToken === databasePassword.reset_token;
  if (!isMatch || databasePassword.reset_token === undefined || databasePassword.reset_token === null)
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Invalid reset token',
    });

  // validate
  const objectSchema = Joi.object({
    password: Joi.string().required(),
    userId: Joi.string().required(),
    resetToken: Joi.string().required(),
  });

  const { error, value } = objectSchema.validate({ password, userId, resetToken });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid reset password object',
      errorMessage: error.message,
    });
  }

  const salt = shortid.generate();
  const hashedPassword = bcrypt.hashSync(salt + password);
  const emailToken = shortid.generate();
  const newResetToken = shortid.generate();

  const token = jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'UPDATE admin_passwords SET password = ?, salt = ?, email_token = ?, reset_token = ?, email_verified = 1 WHERE admin_id = ?',
      [hashedPassword, salt, emailToken, newResetToken, userId]
    );

    await connection.query('INSERT INTO admin_sessions (admin_id, token) VALUES (?, ?)', [userId, token]);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  if (
    resetToken === databasePassword.reset_token &&
    databasePassword.reset_token !== undefined &&
    databasePassword.reset_token !== null
  )
    //  .cookie(`token_${user.cloud}`, token, {
    //       maxAge: 24 * 60 * 60 * 1000,
    //       sameSite: 'None',
    //       httpOnly: true,
    //       secure: true,
    //       domain: req.hostname,
    //       path: '/',
    //       Partitioned: true,
    //     })
    return res.status(200).json({
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
      message: 'Successfully resetPassword user',
    });
};

module.exports = resetPassword;
