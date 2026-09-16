const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const remove = async (req, res) => {
  const conn = await pool.getConnection();
  let updatedRows;
  try {
    await conn.beginTransaction();

    const [updateResult] = await conn.query(
      'UPDATE invoices SET removed = 1 WHERE id = ? AND removed = 0',
      [req.params.id]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Invoice not found',
      });
    }

    await conn.query('UPDATE payments SET removed = 1 WHERE invoice_id = ?', [req.params.id]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [req.params.id]);

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(rows[0]),
    message: 'Invoice deleted successfully',
  });
};

module.exports = remove;
