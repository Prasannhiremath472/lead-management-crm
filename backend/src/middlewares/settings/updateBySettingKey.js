const pool = require('@/db/pool');
const { parseValue, serializeValue } = require('@/db/models/settingModel');

const updateBySettingKey = async ({ settingKey, settingValue }) => {
  try {
    if (!settingKey || !settingValue) {
      return null;
    }

    // Need the existing row's value_type to serialize the new value correctly
    const [existingRows] = await pool.query('SELECT * FROM settings WHERE setting_key = ?', [
      settingKey,
    ]);
    const existing = existingRows[0];

    if (!existing) {
      return null;
    }

    const serializedValue = serializeValue(existing.value_type, settingValue);

    await pool.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [
      serializedValue,
      settingKey,
    ]);

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

module.exports = updateBySettingKey;
