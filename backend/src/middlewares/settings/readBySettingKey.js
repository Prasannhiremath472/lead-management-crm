const pool = require('@/db/pool');
const { parseValue } = require('@/db/models/settingModel');

const readBySettingKey = async ({ settingKey }) => {
  try {
    // Find row by settingKey (intentionally no removed:false filter here,
    // matching the previous Mongoose behavior of this function)

    if (!settingKey) {
      return null;
    }

    const [rows] = await pool.query('SELECT * FROM settings WHERE setting_key = ?', [settingKey]);
    const result = rows[0];

    // If no results found, return document not found
    if (!result) {
      return null;
    } else {
      // Return success response
      return {
        ...result,
        setting_value: parseValue(result.value_type, result.setting_value),
      };
    }
  } catch {
    return null;
  }
};

module.exports = readBySettingKey;
