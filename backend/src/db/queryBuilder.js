// Shared helpers for building parameterized SQL against an allow-listed
// set of columns. Column/field NAMES are always validated against a model
// definition's allow-lists before being interpolated; VALUES are always
// passed as placeholders, never interpolated.

function assertColumn(modelDef, column) {
  if (!modelDef.columns.includes(column)) {
    throw new Error(`Column "${column}" is not defined on ${modelDef.tableName}`);
  }
  return column;
}

function pickAllowedFields(modelDef, body, allowList = modelDef.columns) {
  const result = {};
  for (const key of Object.keys(body || {})) {
    if (allowList.includes(key)) {
      result[key] = body[key];
    }
  }
  return result;
}

function buildInsert(modelDef, fields) {
  const columns = Object.keys(fields);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map((c) => fields[c]);
  const sql = `INSERT INTO ${modelDef.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
  return { sql, values };
}

function buildUpdate(modelDef, fields, whereSql, whereValues) {
  const columns = Object.keys(fields);
  const setClause = columns.map((c) => `${c} = ?`).join(', ');
  const values = columns.map((c) => fields[c]);
  const sql = `UPDATE ${modelDef.tableName} SET ${setClause} WHERE ${whereSql}`;
  return { sql, values: [...values, ...whereValues] };
}

// Builds a case-insensitive OR'd LIKE search across allow-listed columns.
function buildSearchClause(modelDef, fieldsParam, q) {
  const requested = (fieldsParam || 'name').split(',').map((f) => f.trim());
  const fields = requested.filter((f) => modelDef.searchableFields.includes(f));
  if (fields.length === 0) {
    return null;
  }
  const clause = fields.map((f) => `${f} LIKE ?`).join(' OR ');
  const values = fields.map(() => `%${q}%`);
  return { clause: `(${clause})`, values };
}

// Validates a dynamic filter field name against the allow-list. Returns
// null if not allowed (caller should reject the request) or if `equal`
// is an object (blocks operator-injection-style payloads).
function buildFilterClause(modelDef, filterField, equal) {
  if (!filterField) return undefined;
  if (equal !== null && typeof equal === 'object') return null;
  if (!modelDef.filterableFields.includes(filterField)) return null;
  return { clause: `${filterField} = ?`, values: [equal] };
}

function buildSortClause(modelDef, sortByParam, sortValueParam) {
  const sortBy = modelDef.sortableFields.includes(sortByParam) ? sortByParam : modelDef.defaultSort;
  const direction = String(sortValueParam) === '1' || String(sortValueParam).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  return `${sortBy} ${direction}`;
}

// The frontend (React/Redux, unchanged by this port) expects every record
// to carry a Mongo-style `_id` field (used as antd table rowKeys, in route
// params, and in PDF download URLs). Since primary keys are now integers,
// every row/array of rows returned to the client is shaped through this
// helper so `_id` is always present alongside the real `id`.
function withMongoIdShim(row) {
  if (row === null || row === undefined) return row;
  if (Array.isArray(row)) return row.map(withMongoIdShim);
  if (typeof row !== 'object') return row;
  const shaped = { ...row };
  if (shaped.id !== undefined && shaped._id === undefined) {
    shaped._id = String(shaped.id);
  }
  return shaped;
}

module.exports = {
  assertColumn,
  pickAllowedFields,
  buildInsert,
  buildUpdate,
  buildSearchClause,
  buildFilterClause,
  buildSortClause,
  withMongoIdShim,
};
