const bcrypt = require('bcryptjs');

module.exports = {
  tableName: 'admin_passwords',
  entity: 'adminPassword',
  primaryKey: 'id',
  columns: [
    'id',
    'removed',
    'admin_id',
    'password',
    'salt',
    'email_token',
    'reset_token',
    'email_verified',
    'auth_type',
  ],
  filterableFields: [],
  searchableFields: [],
  sortableFields: ['id'],
  defaultSort: 'id',
  generateHash(salt, password) {
    return bcrypt.hashSync(salt + password);
  },
};
