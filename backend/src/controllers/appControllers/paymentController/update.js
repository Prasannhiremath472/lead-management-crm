const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const { calculate } = require('@/helpers');

const update = async (req, res) => {
  if (req.body.amount === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Minimum Amount couldn't be 0`,
    });
  }

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

  const { previous_amount: previousAmount, invoice_id: invoiceId, total, discount, previous_credit: previousCredit } =
    previousPayment;

  const { amount: currentAmount } = req.body;

  const changedAmount = calculate.sub(currentAmount, previousAmount);
  const maxAmount = calculate.sub(total, calculate.add(discount, previousCredit));

  if (changedAmount > maxAmount) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Max Amount you can add is ${maxAmount + previousAmount}`,
      error: `The Max Amount you can add is ${maxAmount + previousAmount}`,
    });
  }

  const paymentStatus =
    calculate.sub(total, discount) === calculate.add(previousCredit, changedAmount)
      ? 'paid'
      : calculate.add(previousCredit, changedAmount) > 0
      ? 'partially'
      : 'unpaid';

  const updatedDate = new Date();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Same explicit column whitelist as the current file. `paymentMode` is
    // dropped: it isn't a real column anywhere and was already a dead,
    // non-functional reference in the pre-rewrite code.
    await conn.query(
      `UPDATE payments SET number = ?, date = ?, amount = ?, ref = ?, description = ?, updated = ?
       WHERE id = ? AND removed = 0`,
      [req.body.number, req.body.date, req.body.amount, req.body.ref, req.body.description, updatedDate, req.params.id]
    );

    await conn.query('UPDATE invoices SET credit = credit + ?, payment_status = ? WHERE id = ?', [
      changedAmount,
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

  const [updatedRows] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(updatedRows[0]),
    message: 'Successfully updated the Payment ',
  });
};

module.exports = update;
