const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const read = async (userModel, req, res) => {
  // Find document by id
  const [rows] = await pool.query(
    'SELECT id, enabled, email, name, surname, photo, role FROM admins WHERE id = ? AND removed = 0',
    [req.params.id]
  );
  const tmpResult = rows[0];
  // If no results found, return document not found
  if (!tmpResult) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  } else {
    // Return success resposne
    return res.status(200).json({
      success: true,
      result: withMongoIdShim(tmpResult),
      message: 'we found this document ',
    });
  }
};

module.exports = read;
