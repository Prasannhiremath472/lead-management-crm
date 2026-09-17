module.exports = {
  tableName: 'product_categories',
  entity: 'productCategory',
  primaryKey: 'id',
  columns: ['id', 'removed', 'enabled', 'name', 'description', 'created_by', 'created', 'updated'],
  filterableFields: ['enabled', 'created_by'],
  searchableFields: ['name', 'description'],
  sortableFields: ['name', 'created', 'updated', 'enabled'],
  defaultSort: 'enabled',
};
