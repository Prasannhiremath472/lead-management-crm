const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');
const { increaseBySettingKey } = require('@/middlewares/settings');

const convert = async (req, res) => {
  const [quoteRows] = await pool.query('SELECT * FROM quotes WHERE id = ? AND removed = 0', [
    req.params.id,
  ]);
  const quote = quoteRows[0];

  if (!quote) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  if (quote.converted_to_invoice_id) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Quote already converted',
    });
  }

  const [quoteItemRows] = await pool.query(
    'SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order',
    [req.params.id]
  );

  const conn = await pool.getConnection();
  let newInvoiceId;
  try {
    await conn.beginTransaction();

    // Read the current last_invoice_number setting inside this transaction's
    // connection so the new invoice number is computed from a value that's
    // consistent with the rest of this unit of work.
    const [settingRows] = await conn.query(
      'SELECT setting_value FROM settings WHERE setting_key = ?',
      ['last_invoice_number']
    );
    const lastInvoiceNumber = settingRows[0] ? parseInt(settingRows[0].setting_value, 10) || 0 : 0;
    const newInvoiceNumber = lastInvoiceNumber + 1;

    // Simplification for this first implementation: always set the new
    // invoice's expired_date to today + 30 days, rather than trying to
    // carry over / validate the quote's own (possibly already past)
    // expired_date.
    const [insertResult] = await conn.query(
      `INSERT INTO invoices
        (removed, created_by, number, year, content, date, expired_date, client_id,
         tax_rate, sub_total, tax_total, total, currency, credit, discount, payment_status,
         status, notes)
       VALUES (0, ?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), ?, ?, ?, ?, ?, ?, 0, ?, 'unpaid', 'draft', ?)`,
      [
        quote.created_by,
        newInvoiceNumber,
        quote.year,
        quote.content,
        quote.client_id,
        quote.tax_rate,
        quote.sub_total,
        quote.tax_total,
        quote.total,
        quote.currency,
        quote.discount,
        quote.notes,
      ]
    );

    newInvoiceId = insertResult.insertId;

    if (quoteItemRows.length > 0) {
      const itemRows = quoteItemRows.map((item) => [
        newInvoiceId,
        item.item_name,
        item.description,
        item.quantity,
        item.price,
        item.total,
        item.sort_order,
      ]);
      await conn.query(
        `INSERT INTO invoice_items (invoice_id, item_name, description, quantity, price, total, sort_order)
         VALUES ?`,
        [itemRows]
      );
    }

    const fileId = 'invoice-' + newInvoiceId + '.pdf';
    await conn.query('UPDATE invoices SET pdf = ? WHERE id = ?', [fileId, newInvoiceId]);

    await conn.query(
      `UPDATE quotes SET converted_to_invoice_id = ?, converted_at = NOW(), status = 'accepted' WHERE id = ?`,
      [newInvoiceId, req.params.id]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  // Non-transactional side effect, matching Invoice's own create.js pattern
  // of incrementing the counter as a fire-and-forget call after commit.
  increaseBySettingKey({
    settingKey: 'last_invoice_number',
  });

  const [newInvoiceRows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [newInvoiceId]);

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(newInvoiceRows[0]),
    message: 'Quote converted to invoice successfully',
  });
};

module.exports = convert;
