const listAllSettings = require('./listAllSettings');

const loadSettings = async () => {
  const allSettings = {};
  const datas = await listAllSettings();
  datas.forEach(({ setting_key, setting_value }) => {
    allSettings[setting_key] = setting_value;
  });
  return allSettings;
};

module.exports = loadSettings;
