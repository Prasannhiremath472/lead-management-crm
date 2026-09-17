module.exports = {
  tableName: 'expense_categories',
  entity: 'expenseCategory',
  primaryKey: 'id',
  columns: ['id', 'removed', 'enabled', 'name', 'description', 'created_by', 'created', 'updated'],
  filterableFields: ['enabled', 'created_by'],
  searchableFields: ['name', 'description'],
  sortableFields: ['name', 'created', 'updated', 'enabled'],
  defaultSort: 'enabled',
};
