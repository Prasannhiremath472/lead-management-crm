const pool = require('@/db/pool');
const { parseValue } = require('@/db/models/settingModel');
const { withMongoIdShim } = require('@/db/queryBuilder');

const listBySettingKey = async (req, res) => {
  // Find rows matching any of the requested setting keys

  const settingKeyArray = req.query.settingKeyArray ? req.query.settingKeyArray.split(',') : [];

  if (settingKeyArray.length === 0) {
    return res
      .status(202)
      .json({
        success: false,
        result: [],
        message: 'Please provide settings you need',
      })
      .end();
  }

  const placeholders = settingKeyArray.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `SELECT * FROM settings WHERE removed = 0 AND setting_key IN (${placeholders})`,
    settingKeyArray
  );

  // If no results found, return document not found
  if (rows.length >= 1) {
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
    return res
      .status(202)
      .json({
        success: false,
        result: [],
        message: 'No document found by this request',
      })
      .end();
  }
};

module.exports = listBySettingKey;
