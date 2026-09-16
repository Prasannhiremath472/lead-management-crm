const pool = require('@/db/pool');
const { getModel } = require('@/db/models');

exports.getData = async ({ model }) => {
  const modelDef = getModel(model);
  const [rows] = await pool.query(
    `SELECT * FROM ${modelDef.tableName} WHERE removed = 0 AND enabled = 1`
  );
  return rows;
};

exports.getOne = async ({ model, id }) => {
  const modelDef = getModel(model);
  const [rows] = await pool.query(
    `SELECT * FROM ${modelDef.tableName} WHERE id = ? AND removed = 0`,
    [id]
  );
  return rows[0];
};
