const pool = require('@/db/pool');
const {
  buildSearchClause,
  buildFilterClause,
  buildSortClause,
  withMongoIdShim,
} = require('@/db/queryBuilder');

const paginatedList = async (modelDef, req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;

  const { sortBy, sortValue = -1, filter, equal } = req.query;

  const whereClauses = ['removed = 0'];
  const whereValues = [];

  if (req.query.fields) {
    const searchClause = buildSearchClause(modelDef, req.query.fields, req.query.q);
    if (searchClause) {
      whereClauses.push(searchClause.clause);
      whereValues.push(...searchClause.values);
    }
  }

  if (filter && equal !== undefined) {
    const filterClause = buildFilterClause(modelDef, filter, equal);
    if (filterClause === null) {
      return res.status(400).json({
        success: false,
        result: [],
        message: 'Invalid filter value',
      });
    }
    if (filterClause) {
      whereClauses.push(filterClause.clause);
      whereValues.push(...filterClause.values);
    }
  }

  const whereSql = whereClauses.join(' AND ');
  const orderSql = buildSortClause(modelDef, sortBy, sortValue);

  const [rows] = await pool.query(
    `SELECT * FROM ${modelDef.tableName} WHERE ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`,
    [...whereValues, limit, skip]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS count FROM ${modelDef.tableName} WHERE ${whereSql}`,
    whereValues
  );
  const count = countRows[0].count;

  const pages = Math.ceil(count / limit);
  const pagination = { page, pages, count };

  if (count === 0) {
    return res.status(203).json({
      success: true,
      result: [],
      pagination,
      message: 'Collection is Empty',
    });
  }

  // Batch-fetch product_categories to avoid N+1, mirroring
  // invoiceController/paginatedList.js's createdBy/client batching pattern.
  const categoryIds = [
    ...new Set(rows.map((r) => r.category_id).filter((v) => v !== null && v !== undefined)),
  ];

  const [categoryRows] =
    categoryIds.length > 0
      ? await pool.query(
          `SELECT * FROM product_categories WHERE id IN (${categoryIds.map(() => '?').join(',')})`,
          categoryIds
        )
      : [[]];

  const categoryMap = new Map(categoryRows.map((r) => [r.id, withMongoIdShim(r)]));

  const result = rows.map((row) => {
    const shaped = { ...row };
    if (row.category_id && categoryMap.has(row.category_id)) {
      shaped.category = categoryMap.get(row.category_id);
    }
    return shaped;
  });

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(result),
    pagination,
    message: 'Successfully found all documents',
  });
};

module.exports = paginatedList;
