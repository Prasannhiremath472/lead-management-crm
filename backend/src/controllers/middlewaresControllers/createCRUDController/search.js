const pool = require('@/db/pool');
const { buildSearchClause, withMongoIdShim } = require('@/db/queryBuilder');

const search = async (modelDef, req, res) => {
  const searchClause = buildSearchClause(modelDef, req.query.fields, req.query.q);

  if (!searchClause) {
    return res
      .status(202)
      .json({
        success: false,
        result: [],
        message: 'No document found by this request',
      })
      .end();
  }

  const [rows] = await pool.query(
    `SELECT * FROM ${modelDef.tableName} WHERE removed = 0 AND ${searchClause.clause} LIMIT 20`,
    searchClause.values
  );

  if (rows.length >= 1) {
    return res.status(200).json({
      success: true,
      result: withMongoIdShim(rows),
      message: 'Successfully found all documents',
    });
  } else {
    return res
      .status(202)
      .json({
        success: false,
        result: [],
        message: 'No document found by this request',
      })
      .end();
  }
};

module.exports = search;
