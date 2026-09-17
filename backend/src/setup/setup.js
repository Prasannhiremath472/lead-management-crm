require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { globSync } = require('glob');
const fs = require('fs');
const { nanoid: uniqueId } = require('nanoid');

const pool = require('../db/pool');
const adminPasswordModel = require('../db/models/adminPasswordModel');
const settingModel = require('../db/models/settingModel');

async function setupApp() {
  try {
    const salt = uniqueId();
    const passwordHash = adminPasswordModel.generateHash(salt, 'admin123');

    const [adminResult] = await pool.query(
      'INSERT INTO admins (email, name, surname, enabled, role) VALUES (?, ?, ?, ?, ?)',
      ['admin@admin.com', 'Admin', 'User', 1, 'owner']
    );

    await pool.query(
      'INSERT INTO admin_passwords (admin_id, password, salt, email_verified) VALUES (?, ?, ?, ?)',
      [adminResult.insertId, passwordHash, salt, 1]
    );

    console.log('👍 Admin created : Done!');

    const settingFiles = [];
    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      settingFiles.push(...file);
    }

    for (const setting of settingFiles) {
      const valueType = setting.valueType || 'string';
      const serializedValue = settingModel.serializeValue(valueType, setting.settingValue);

      await pool.query(
        `INSERT INTO settings
          (setting_category, setting_key, setting_value, value_type, is_private, is_core_setting)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          setting.settingCategory,
          setting.settingKey,
          serializedValue,
          valueType,
          setting.isPrivate ? 1 : 0,
          setting.isCoreSetting === false ? 0 : setting.isCoreSetting ? 1 : 0,
        ]
      );
    }

    console.log('👍 Settings created : Done!');

    console.log('🥳 Setup completed :Success!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit();
  }
}

setupApp();
