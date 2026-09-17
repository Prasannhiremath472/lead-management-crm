const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const read = async (modelDef, req, res) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${modelDef.tableName} WHERE ${modelDef.primaryKey} = ? AND removed = 0`,
    [req.params.id]
  );

  const expense = rows[0];

  if (!expense) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  const result = { ...expense };

  if (expense.category_id) {
    const [categoryRows] = await pool.query('SELECT * FROM expense_categories WHERE id = ?', [
      expense.category_id,
    ]);
    if (categoryRows[0]) {
      result.category = withMongoIdShim(categoryRows[0]);
    }
  }

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(result),
    message: 'we found this document ',
  });
};

module.exports = read;
