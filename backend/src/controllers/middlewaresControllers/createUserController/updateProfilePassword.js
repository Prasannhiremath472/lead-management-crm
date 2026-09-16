const bcrypt = require('bcryptjs');

const { generate: uniqueId } = require('shortid');

const pool = require('@/db/pool');

const updateProfilePassword = async (userModel, req, res) => {
  const reqUserName = userModel.toLowerCase();
  const userProfile = req[reqUserName];
  let { password, passwordCheck } = req.body;

  if (!password || !passwordCheck) return res.status(400).json({ msg: 'Not all fields have been entered.' });

  if (password.length < 8)
    return res.status(400).json({
      msg: 'The password needs to be at least 8 characters long.',
    });

  if (password !== passwordCheck)
    return res.status(400).json({ msg: 'Enter the same password twice for verification.' });

  // Find document by id and updates with the required fields

  const salt = uniqueId();

  const passwordHash = bcrypt.hashSync(salt + password);

  if (userProfile.email === 'admin@admin.com') {
    return res.status(403).json({
      success: false,
      result: null,
      message: "you couldn't update demo password",
    });
  }

  const [updateResult] = await pool.query(
    'UPDATE admin_passwords SET password = ?, salt = ? WHERE admin_id = ? AND removed = 0',
    [passwordHash, salt, userProfile.id]
  );

  if (!updateResult || updateResult.affectedRows === 0) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "User Password couldn't save correctly",
    });
  }

  return res.status(200).json({
    success: true,
    result: {},
    message: 'we update the password by this id: ' + userProfile.id,
  });
};

module.exports = updateProfilePassword;
