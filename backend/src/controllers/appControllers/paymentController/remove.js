const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const remove = async (req, res) => {
  // Explicit JOIN replacing the old mongoose-autopopulate on `previousPayment.invoice`.
  const [rows] = await pool.query(
    `SELECT p.id, p.amount AS previous_amount, p.invoice_id,
            i.total, i.discount, i.credit AS previous_credit
     FROM payments p JOIN invoices i ON i.id = p.invoice_id
     WHERE p.id = ? AND p.removed = 0`,
    [req.params.id]
  );

  const previousPayment = rows[0];

  if (!previousPayment) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  const {
    previous_amount: previousAmount,
    invoice_id: invoiceId,
    total,
    discount,
    previous_credit: previousCredit,
  } = previousPayment;

  // Ported verbatim: the current code uses raw arithmetic here (not the
  // calculate.* decimal-safe helper), unlike create.js/update.js.
  const paymentStatus =
    total - discount === previousCredit - previousAmount
      ? 'paid'
      : previousCredit - previousAmount > 0
      ? 'partially'
      : 'unpaid';

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE payments SET removed = 1 WHERE id = ? AND removed = 0', [
      req.params.id,
    ]);

    await conn.query('UPDATE invoices SET credit = credit - ?, payment_status = ? WHERE id = ?', [
      previousAmount,
      paymentStatus,
      invoiceId,
    ]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [removedRows] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(removedRows[0]),
    message: 'Successfully Deleted the document ',
  });
};

module.exports = remove;
