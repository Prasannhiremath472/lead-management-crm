const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');
const quoteModel = require('@/db/models/quoteModel');

const paginatedList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;

  const { sortBy = 'created', sortValue = -1, filter, equal } = req.query;

  const whereClauses = ['removed = 0'];
  const whereValues = [];

  if (filter !== undefined && equal !== undefined) {
    // Object-injection guard: raw SQL means column names/values must be
    // strictly allow-listed and scalar, unlike the old Mongo `[filter]: equal`
    // spread which merely risked NoSQL operator injection.
    if (equal !== null && typeof equal === 'object') {
      return res.status(400).json({
        success: false,
        result: [],
        message: 'Invalid filter value',
      });
    }
    if (!quoteModel.filterableFields.includes(filter)) {
      return res.status(400).json({
        success: false,
        result: [],
        message: 'Invalid filter field',
      });
    }
    whereClauses.push(`${filter} = ?`);
    whereValues.push(equal);
  }

  if (req.query.fields && req.query.q !== undefined) {
    const requestedFields = req.query.fields.split(',').map((f) => f.trim());
    const allowedFields = requestedFields.filter((f) => quoteModel.searchableFields.includes(f));
    if (allowedFields.length > 0) {
      whereClauses.push('(' + allowedFields.map((f) => `${f} LIKE ?`).join(' OR ') + ')');
      allowedFields.forEach(() => whereValues.push(`%${req.query.q}%`));
    }
  }

  const whereSql = whereClauses.join(' AND ');
  const sortBySafe = quoteModel.sortableFields.includes(sortBy) ? sortBy : quoteModel.defaultSort;
  const direction =
    String(sortValue) === '1' || String(sortValue).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const [rows] = await pool.query(
    `SELECT * FROM quotes WHERE ${whereSql} ORDER BY ${sortBySafe} ${direction} LIMIT ? OFFSET ?`,
    [...whereValues, limit, skip]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS count FROM quotes WHERE ${whereSql}`,
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

  // Batch-fetch populated createdBy/client, replicating .populate('createdBy','name')
  // and the mongoose-autopopulate behavior on `client`, without N+1 queries.
  const createdByIds = [...new Set(rows.map((r) => r.created_by).filter((v) => v !== null && v !== undefined))];
  const clientIds = [...new Set(rows.map((r) => r.client_id).filter((v) => v !== null && v !== undefined))];

  const [createdByRows, clientRows] = await Promise.all([
    createdByIds.length > 0
      ? pool.query(`SELECT id, name FROM admins WHERE id IN (${createdByIds.map(() => '?').join(',')})`, createdByIds)
      : Promise.resolve([[]]),
    clientIds.length > 0
      ? pool.query(`SELECT * FROM clients WHERE id IN (${clientIds.map(() => '?').join(',')})`, clientIds)
      : Promise.resolve([[]]),
  ]);

  const createdByMap = new Map(createdByRows[0].map((r) => [r.id, withMongoIdShim(r)]));
  const clientMap = new Map(clientRows[0].map((r) => [r.id, withMongoIdShim(r)]));

  const result = rows.map((row) => {
    const shaped = { ...row };
    if (createdByMap.has(row.created_by)) {
      shaped.createdBy = createdByMap.get(row.created_by);
    }
    if (clientMap.has(row.client_id)) {
      shaped.client = clientMap.get(row.client_id);
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
