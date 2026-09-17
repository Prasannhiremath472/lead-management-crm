const bcrypt = require('bcryptjs');
const { nanoid: uniqueId } = require('nanoid');

const pool = require('@/db/pool');

const updatePassword = async (userModel, req, res) => {
  const reqUserName = userModel.toLowerCase();
  const userProfile = req[reqUserName];

  let { password } = req.body;

  if (password.length < 8)
    return res.status(400).json({
      msg: 'The password needs to be at least 8 characters long.',
    });

  // Find document by id and updates with the required fields

  if (userProfile.email === 'admin@admin.com') {
    return res.status(403).json({
      success: false,
      result: null,
      message: "you couldn't update demo password",
    });
  }

  const salt = uniqueId();

  const passwordHash = bcrypt.hashSync(salt + password);

  const [updateResult] = await pool.query(
    'UPDATE admin_passwords SET password = ?, salt = ? WHERE admin_id = ? AND removed = 0',
    [passwordHash, salt, req.params.id]
  );

  // Code to handle the successful response

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

module.exports = updatePassword;
