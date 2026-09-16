const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const updateProfile = async (userModel, req, res) => {
  const reqUserName = userModel.toLowerCase();
  const userProfile = req[reqUserName];

  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (userProfile.email === 'admin@demo.com') {
    return res.status(403).json({
      success: false,
      result: null,
      message: "you couldn't update demo informations",
    });
  }

  if (req.body.photo) {
    await pool.query(
      'UPDATE admins SET email = ?, name = ?, surname = ?, photo = ? WHERE id = ? AND removed = 0',
      [req.body.email, req.body.name, req.body.surname, req.body.photo, userProfile.id]
    );
  } else {
    await pool.query('UPDATE admins SET email = ?, name = ?, surname = ? WHERE id = ? AND removed = 0', [
      req.body.email,
      req.body.name,
      req.body.surname,
      userProfile.id,
    ]);
  }

  const [rows] = await pool.query('SELECT * FROM admins WHERE id = ? AND removed = 0', [userProfile.id]);
  const result = rows[0];

  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No profile found by this id: ' + userProfile.id,
    });
  }
  return res.status(200).json({
    success: true,
    result: withMongoIdShim({
      id: result?.id,
      enabled: result?.enabled,
      email: result?.email,
      name: result?.name,
      surname: result?.surname,
      photo: result?.photo,
      role: result?.role,
      token,
    }),
    message: 'we update this profile by this id: ' + userProfile.id,
  });
};

module.exports = updateProfile;
