module.exports = {
  tableName: 'admins',
  entity: 'admin',
  primaryKey: 'id',
  columns: ['id', 'removed', 'enabled', 'email', 'name', 'surname', 'photo', 'role', 'created'],
  filterableFields: ['email', 'enabled', 'role'],
  searchableFields: ['name', 'surname', 'email'],
  sortableFields: ['name', 'email', 'created'],
  defaultSort: 'created',
};
