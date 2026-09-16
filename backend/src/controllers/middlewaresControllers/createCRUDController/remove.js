const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const remove = async (modelDef, req, res) => {
  const [existingRows] = await pool.query(
    `SELECT * FROM ${modelDef.tableName} WHERE ${modelDef.primaryKey} = ?`,
    [req.params.id]
  );

  if (existingRows.length === 0) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  await pool.query(`UPDATE ${modelDef.tableName} SET removed = 1 WHERE ${modelDef.primaryKey} = ?`, [
    req.params.id,
  ]);

  const [rows] = await pool.query(
    `SELECT * FROM ${modelDef.tableName} WHERE ${modelDef.primaryKey} = ?`,
    [req.params.id]
  );

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(rows[0]),
    message: 'Successfully Deleted the document ',
  });
};

module.exports = remove;
