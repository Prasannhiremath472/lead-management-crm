const useAppSettings = () => {
  let settings = {};
  settings['idurar_app_email'] = process.env.APP_EMAIL || 'noreply@example.com';
  settings['idurar_base_url'] = process.env.APP_BASE_URL || 'http://localhost:3000';
  return settings;
};

module.exports = useAppSettings;
