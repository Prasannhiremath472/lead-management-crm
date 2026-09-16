const pool = require('@/db/pool');
const { parseValue } = require('@/db/models/settingModel');
const { withMongoIdShim } = require('@/db/queryBuilder');

const listAll = async (req, res) => {
  const sort = req.query.sort && parseInt(req.query.sort) === 1 ? 'ASC' : 'DESC';

  // Query the database for a list of all results
  const [rows] = await pool.query(
    `SELECT * FROM settings WHERE removed = 0 AND is_private = 0 ORDER BY id ${sort}`
  );

  if (rows.length > 0) {
    const result = rows.map((row) => ({
      ...row,
      setting_value: parseValue(row.value_type, row.setting_value),
    }));
    return res.status(200).json({
      success: true,
      result: withMongoIdShim(result),
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = listAll;
