const pool = require('@/db/pool');
const { parseValue } = require('@/db/models/settingModel');

const increaseBySettingKey = async ({ settingKey }) => {
  try {
    if (!settingKey) {
      return null;
    }

    await pool.query(
      'UPDATE settings SET setting_value = CAST(CAST(setting_value AS SIGNED) + 1 AS CHAR) WHERE setting_key = ?',
      [settingKey]
    );

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

module.exports = increaseBySettingKey;
