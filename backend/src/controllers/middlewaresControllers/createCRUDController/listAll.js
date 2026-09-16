const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const listAll = async (modelDef, req, res) => {
  const sort = String(req.query.sort || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const enabled = req.query.enabled;

  let sql = `SELECT * FROM ${modelDef.tableName} WHERE removed = 0`;
  const values = [];

  if (enabled !== undefined) {
    sql += ' AND enabled = ?';
    values.push(enabled === 'true' || enabled === '1' || enabled === true ? 1 : 0);
  }

  sql += ` ORDER BY created ${sort}`;

  const [rows] = await pool.query(sql, values);

  if (rows.length > 0) {
    return res.status(200).json({
      success: true,
      result: withMongoIdShim(rows),
      message: 'Successfully found all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = listAll;
