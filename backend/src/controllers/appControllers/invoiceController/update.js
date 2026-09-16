const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const { calculate } = require('@/helpers');
const schema = require('./schemaValidate');

const update = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const [previousRows] = await pool.query('SELECT * FROM invoices WHERE id = ? AND removed = 0', [
    req.params.id,
  ]);
  const previousInvoice = previousRows[0];

  if (!previousInvoice) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  const { credit } = previousInvoice;

  const { items = [], taxRate = 0, discount = 0 } = req.body;

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Items cannot be empty',
    });
  }

  // default
  let subTotal = 0;
  let taxTotal = 0;
  let total = 0;

  //Calculate the items array with subTotal, total, taxTotal
  items.map((item) => {
    let itemTotal = calculate.multiply(item['quantity'], item['price']);
    //sub total
    subTotal = calculate.add(subTotal, itemTotal);
    //item total
    item['total'] = itemTotal;
  });
  taxTotal = calculate.multiply(subTotal, taxRate / 100);
  total = calculate.add(subTotal, taxTotal);

  const pdf = 'invoice-' + req.params.id + '.pdf';

  if (body.hasOwnProperty('currency')) {
    delete body.currency;
  }
  if (value.hasOwnProperty('currency')) {
    delete value.currency;
  }

  const paymentStatus =
    calculate.sub(total, discount) === credit ? 'paid' : credit > 0 ? 'partially' : 'unpaid';

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE invoices SET
        number = ?, year = ?, content = ?, recurring = ?, date = ?, expired_date = ?, client_id = ?,
        tax_rate = ?, sub_total = ?, tax_total = ?, total = ?, credit = ?, discount = ?,
        payment_status = ?, is_overdue = ?, approved = ?, notes = ?, status = ?, pdf = ?,
        updated = NOW()
       WHERE id = ? AND removed = 0`,
      [
        value.number,
        value.year,
        value.content || null,
        value.recurring || null,
        value.date,
        value.expiredDate,
        value.client,
        taxRate,
        subTotal,
        taxTotal,
        total,
        credit,
        discount,
        paymentStatus,
        value.isOverdue ? 1 : 0,
        value.approved ? 1 : 0,
        value.notes || null,
        value.status,
        pdf,
        req.params.id,
      ]
    );

    await conn.query('DELETE FROM invoice_items WHERE invoice_id = ?', [req.params.id]);

    if (items.length > 0) {
      const itemRows = items.map((item, index) => [
        req.params.id,
        item.itemName,
        item.description || null,
        item.quantity,
        item.price,
        item.total,
        index,
      ]);
      await conn.query(
        `INSERT INTO invoice_items (invoice_id, item_name, description, quantity, price, total, sort_order)
         VALUES ?`,
        [itemRows]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [invoiceRows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
  const [itemsRows] = await pool.query(
    'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order',
    [req.params.id]
  );

  const result = withMongoIdShim(invoiceRows[0]);
  result.items = itemsRows;

  return res.status(200).json({
    success: true,
    result,
    message: 'we update this document ',
  });
};

module.exports = update;
