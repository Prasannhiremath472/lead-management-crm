const pool = require('@/db/pool');
const { parseValue } = require('@/db/models/settingModel');

const listAllSettings = async () => {
  try {
    // Query the database for a list of all results
    const [rows] = await pool.query('SELECT * FROM settings WHERE removed = 0');

    if (rows.length > 0) {
      // Parse setting_value back to its real type (string/number/boolean/array)
      // using value_type, mirroring what Mongoose's Mixed type gave us for free.
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

module.exports = listAllSettings;
