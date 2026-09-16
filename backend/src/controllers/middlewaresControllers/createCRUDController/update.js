const pool = require('@/db/pool');
const { pickAllowedFields, buildUpdate, withMongoIdShim } = require('@/db/queryBuilder');

const update = async (modelDef, req, res) => {
  const fields = pickAllowedFields(modelDef, req.body);
  fields.removed = 0;

  const [existingRows] = await pool.query(
    `SELECT ${modelDef.primaryKey} FROM ${modelDef.tableName} WHERE ${modelDef.primaryKey} = ? AND removed = 0`,
    [req.params.id]
  );
  if (existingRows.length === 0) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  const { sql, values } = buildUpdate(
    modelDef,
    fields,
    `${modelDef.primaryKey} = ? AND removed = 0`,
    [req.params.id]
  );
  await pool.query(sql, values);

  const [rows] = await pool.query(
    `SELECT * FROM ${modelDef.tableName} WHERE ${modelDef.primaryKey} = ?`,
    [req.params.id]
  );

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(rows[0]),
    message: 'we update this document ',
  });
};

module.exports = update;
