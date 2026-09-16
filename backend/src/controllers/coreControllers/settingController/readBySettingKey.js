const pool = require('@/db/pool');
const { parseValue } = require('@/db/models/settingModel');
const { withMongoIdShim } = require('@/db/queryBuilder');

const readBySettingKey = async (req, res) => {
  // Find row by settingKey
  const settingKey = req.params.settingKey || undefined;

  if (!settingKey) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settingKey provided ',
    });
  }

  const [rows] = await pool.query('SELECT * FROM settings WHERE setting_key = ?', [settingKey]);
  const result = rows[0];

  // If no results found, return document not found
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found by this settingKey: ' + settingKey,
    });
  } else {
    // Return success response
    const parsedResult = {
      ...result,
      setting_value: parseValue(result.value_type, result.setting_value),
    };
    return res.status(200).json({
      success: true,
      result: withMongoIdShim(parsedResult),
      message: 'we found this document by this settingKey: ' + settingKey,
    });
  }
};

module.exports = readBySettingKey;
