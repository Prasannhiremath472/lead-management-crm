const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const remove = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [updateResult] = await conn.query(
      'UPDATE quotes SET removed = 1 WHERE id = ? AND removed = 0',
      [req.params.id]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Quote not found',
      });
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [rows] = await pool.query('SELECT * FROM quotes WHERE id = ?', [req.params.id]);

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(rows[0]),
    message: 'Quote deleted successfully',
  });
};

module.exports = remove;
