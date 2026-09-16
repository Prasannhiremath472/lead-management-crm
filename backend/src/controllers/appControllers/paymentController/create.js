const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const { calculate } = require('@/helpers');

const create = async (req, res) => {
  // Creating a new document in the collection
  if (req.body.amount === 0) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Minimum Amount couldn't be 0`,
    });
  }

  const [invoiceRows] = await pool.query('SELECT * FROM invoices WHERE id = ? AND removed = 0', [
    req.body.invoice,
  ]);
  const currentInvoice = invoiceRows[0];

  const {
    total: previousTotal,
    discount: previousDiscount,
    credit: previousCredit,
  } = currentInvoice;

  const maxAmount = calculate.sub(calculate.sub(previousTotal, previousDiscount), previousCredit);

  if (req.body.amount > maxAmount) {
    return res.status(202).json({
      success: false,
      result: null,
      message: `The Max Amount you can add is ${maxAmount}`,
    });
  }

  const createdBy = req.admin.id;
  const { amount, number, date, ref, description, client, invoice, currency } = req.body;

  const { total, discount, credit } = currentInvoice;

  const paymentStatus =
    calculate.sub(total, discount) === calculate.add(credit, amount)
      ? 'paid'
      : calculate.add(credit, amount) > 0
      ? 'partially'
      : 'unpaid';

  const conn = await pool.getConnection();
  let insertId;
  try {
    await conn.beginTransaction();

    const [insertResult] = await conn.query(
      `INSERT INTO payments
        (removed, created_by, number, client_id, invoice_id, date, amount, currency, ref, description)
       VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        createdBy,
        number,
        client,
        invoice,
        date,
        amount,
        currency || 'NA',
        ref || null,
        description || null,
      ]
    );

    insertId = insertResult.insertId;

    const fileId = 'payment-' + insertId + '.pdf';
    await conn.query('UPDATE payments SET pdf = ? WHERE id = ?', [fileId, insertId]);

    await conn.query('UPDATE invoices SET credit = credit + ?, payment_status = ? WHERE id = ?', [
      amount,
      paymentStatus,
      invoice,
    ]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [paymentRows] = await pool.query('SELECT * FROM payments WHERE id = ?', [insertId]);

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(paymentRows[0]),
    message: 'Payment Invoice created successfully',
  });
};

module.exports = create;
