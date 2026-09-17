const Joi = require('joi');

const pool = require('@/db/pool');

const checkAndCorrectURL = require('./checkAndCorrectURL');
const sendMail = require('./sendMail');
const { nanoid } = require('nanoid');
const { loadSettings } = require('@/middlewares/settings');

const { useAppSettings } = require('@/settings');

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
  });

  const { error, value } = objectSchema.validate({ email });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      error: error,
      message: 'Invalid email.',
      errorMessage: error.message,
    });
  }

  const [userRows] = await pool.query('SELECT * FROM admins WHERE email = ? AND removed = 0', [email]);
  const user = userRows[0];

  // console.log(user);
  if (!user)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  const [passwordRows] = await pool.query(
    'SELECT * FROM admin_passwords WHERE admin_id = ? AND removed = 0',
    [user.id]
  );
  const databasePassword = passwordRows[0];

  const resetToken = nanoid();
  await pool.query('UPDATE admin_passwords SET reset_token = ? WHERE admin_id = ?', [resetToken, user.id]);

  const settings = useAppSettings();
  const idurar_app_email = settings['idurar_app_email'];
  const idurar_base_url = settings['idurar_base_url'];

  const url = checkAndCorrectURL(idurar_base_url);

  const link = url + '/resetpassword/' + String(user.id) + '/' + resetToken;

  await sendMail({
    email,
    name: user.name,
    link,
    subject: 'Reset your password',
    idurar_app_email,
    type: 'passwordVerfication',
  });

  return res.status(200).json({
    success: true,
    result: null,
    message: 'Check your email inbox , to reset your password',
  });
};

module.exports = forgetPassword;
