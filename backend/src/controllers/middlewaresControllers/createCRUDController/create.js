const pool = require('@/db/pool');
const { pickAllowedFields, buildInsert, withMongoIdShim } = require('@/db/queryBuilder');

const create = async (modelDef, req, res) => {
  const fields = pickAllowedFields(modelDef, req.body);
  fields.removed = 0;

  const { sql, values } = buildInsert(modelDef, fields);
  const [insertResult] = await pool.query(sql, values);

  const [rows] = await pool.query(
    `SELECT * FROM ${modelDef.tableName} WHERE ${modelDef.primaryKey} = ?`,
    [insertResult.insertId]
  );

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(rows[0]),
    message: 'Successfully Created the document in Model ',
  });
};

module.exports = create;
