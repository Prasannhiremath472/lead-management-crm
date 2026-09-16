const pool = require('@/db/pool');
const { parseValue } = require('@/db/models/settingModel');

const listBySettingKey = async ({ settingKeyArray = [] }) => {
  try {
    // Find rows matching any of the requested setting keys

    if (settingKeyArray.length === 0) {
      return [];
    }

    const placeholders = settingKeyArray.map(() => '?').join(', ');
    const [rows] = await pool.query(
      `SELECT * FROM settings WHERE removed = 0 AND setting_key IN (${placeholders})`,
      settingKeyArray
    );

    // If no results found, return document not found
    if (rows.length >= 1) {
      return rows.map((row) => ({
        ...row,
        setting_value: parseValue(row.value_type, row.setting_value),
      }));
    } else {
      return [];
    }
  } catch {
    return [];
  }
};

module.exports = listBySettingKey;
