const pool = require('@/db/pool');
const { buildFilterClause } = require('@/db/queryBuilder');

const summary = async (modelDef, req, res) => {
  const countAllPromise = pool.query(
    `SELECT COUNT(*) AS count FROM ${modelDef.tableName} WHERE removed = 0`
  );

  const filterClause = buildFilterClause(modelDef, req.query.filter, req.query.equal);
  const countFilterPromise =
    filterClause && filterClause !== null
      ? pool.query(
          `SELECT COUNT(*) AS count FROM ${modelDef.tableName} WHERE removed = 0 AND ${filterClause.clause}`,
          filterClause.values
        )
      : Promise.resolve([[{ count: 0 }]]);

  const [[countAllRows], [countFilterRows]] = await Promise.all([countAllPromise, countFilterPromise]);

  const countAllDocs = countAllRows[0].count;
  const countFilter = countFilterRows[0].count;

  if (countAllDocs > 0) {
    return res.status(200).json({
      success: true,
      result: { countFilter, countAllDocs },
      message: 'Successfully count all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = summary;
