const pool = require('@/db/pool');
const { serializeValue } = require('@/db/models/settingModel');

const updateManySetting = async (req, res) => {
  // req.body = { settings: [{settingKey:"",settingValue}] }
  let settingsHasError = false;
  const updateDataArray = [];
  const { settings } = req.body;

  for (const setting of settings) {
    if (!setting.hasOwnProperty('settingKey') || !setting.hasOwnProperty('settingValue')) {
      settingsHasError = true;
      break;
    }

    const { settingKey, settingValue } = setting;

    updateDataArray.push({ settingKey, settingValue });
  }

  if (updateDataArray.length === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'No settings provided ',
    });
  }
  if (settingsHasError) {
    return res.status(202).json({
      success: false,
      result: null,
      message: 'Settings provided has Error',
    });
  }

  const connection = await pool.getConnection();
  let totalAffected = 0;

  try {
    await connection.beginTransaction();

    for (const { settingKey, settingValue } of updateDataArray) {
      const [existingRows] = await connection.query(
        'SELECT value_type FROM settings WHERE setting_key = ?',
        [settingKey]
      );
      const existing = existingRows[0];

      if (!existing) {
        continue;
      }

      const serializedValue = serializeValue(existing.value_type, settingValue);

      const [updateResult] = await connection.query(
        'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
        [serializedValue, settingKey]
      );

      totalAffected += updateResult.affectedRows;
    }

    if (totalAffected < 1) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No settings found by to update',
      });
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      result: [],
      message: 'we update all settings',
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = updateManySetting;
