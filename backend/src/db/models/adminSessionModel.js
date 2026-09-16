module.exports = {
  tableName: 'admin_sessions',
  entity: 'adminSession',
  primaryKey: 'id',
  columns: ['id', 'admin_id', 'token', 'created_at'],
  filterableFields: [],
  searchableFields: [],
  sortableFields: ['created_at'],
  defaultSort: 'created_at',
};
