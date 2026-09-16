module.exports = {
  tableName: 'settings',
  entity: 'setting',
  primaryKey: 'id',
  columns: [
    'id',
    'removed',
    'enabled',
    'setting_category',
    'setting_key',
    'setting_value',
    'value_type',
    'is_private',
    'is_core_setting',
  ],
  filterableFields: ['setting_category', 'setting_key', 'enabled', 'is_private', 'is_core_setting'],
  searchableFields: ['setting_key', 'setting_category'],
  sortableFields: ['setting_key', 'setting_category'],
  defaultSort: 'setting_category',

  // Mongoose `Mixed` replacement: setting_value is stored as TEXT and
  // parsed/serialized based on the value_type discriminator.
  parseValue(valueType, rawValue) {
    if (rawValue === null || rawValue === undefined) return rawValue;
    switch (valueType) {
      case 'number':
        return Number(rawValue);
      case 'boolean':
        return rawValue === 'true' || rawValue === true;
      case 'array':
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return [];
        }
      default:
        return rawValue;
    }
  },

  serializeValue(valueType, value) {
    switch (valueType) {
      case 'number':
        return String(value);
      case 'boolean':
        return value ? 'true' : 'false';
      case 'array':
        return JSON.stringify(value);
      default:
        return value === null || value === undefined ? null : String(value);
    }
  },
};
