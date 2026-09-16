const pool = require('@/db/pool');
const { buildFilterClause, withMongoIdShim } = require('@/db/queryBuilder');

const filter = async (modelDef, req, res) => {
  if (req.query.filter === undefined || req.query.equal === undefined) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'filter not provided correctly',
    });
  }

  const filterClause = buildFilterClause(modelDef, req.query.filter, req.query.equal);
  if (!filterClause) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'filter not provided correctly',
    });
  }

  const [rows] = await pool.query(
    `SELECT * FROM ${modelDef.tableName} WHERE removed = 0 AND ${filterClause.clause}`,
    filterClause.values
  );

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(rows),
    message: 'Successfully found all documents  ',
  });
};

module.exports = filter;
