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

  const [previousRows] = await pool.query('SELECT * FROM orders WHERE id = ? AND removed = 0', [
    req.params.id,
  ]);
  const previousOrder = previousRows[0];

  if (!previousOrder) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  const { credit } = previousOrder;

  const { items = [], taxRate = 0, discount = 0 } = value;

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Items cannot be empty',
    });
  }

  if (body.hasOwnProperty('currency')) {
    delete body.currency;
  }
  if (value.hasOwnProperty('currency')) {
    delete value.currency;
  }

  const pdf = 'order-' + req.params.id + '.pdf';

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Re-validate every item against the current product record on every
    // update too, for the same reason as create.js: never trust a client
    // -submitted price/total, always snapshot the DB's authoritative value.
    const correctedItems = [];
    for (const item of items) {
      const [productRows] = await conn.query(
        'SELECT name, price FROM products WHERE id = ? AND removed = 0',
        [item.product]
      );
      const product = productRows[0];
      if (!product) {
        throw new Error(`Product with id ${item.product} not found`);
      }

      const itemTotal = calculate.multiply(item.quantity, product.price);

      correctedItems.push({
        ...item,
        itemName: product.name,
        price: product.price,
        total: itemTotal,
      });
    }

    let subTotal = 0;
    correctedItems.forEach((item) => {
      subTotal = calculate.add(subTotal, item.total);
    });
    const taxTotal = calculate.multiply(subTotal, taxRate / 100);
    const total = calculate.add(subTotal, taxTotal);

    const paymentStatus =
      calculate.sub(total, discount) === credit ? 'paid' : credit > 0 ? 'partially' : 'unpaid';

    await conn.query(
      `UPDATE orders SET
        number = ?, year = ?, date = ?, client_id = ?, tax_rate = ?, sub_total = ?, tax_total = ?,
        total = ?, discount = ?, credit = ?, notes = ?, status = ?, payment_status = ?, pdf = ?,
        updated = NOW()
       WHERE id = ? AND removed = 0`,
      [
        value.number,
        value.year,
        value.date,
        value.client,
        taxRate,
        subTotal,
        taxTotal,
        total,
        discount,
        credit,
        value.notes || null,
        value.status,
        paymentStatus,
        pdf,
        req.params.id,
      ]
    );

    await conn.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);

    if (correctedItems.length > 0) {
      const itemRows = correctedItems.map((item, index) => [
        req.params.id,
        item.product,
        item.itemName,
        item.description || null,
        item.quantity,
        item.price,
        item.total,
        index,
      ]);
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, item_name, description, quantity, price, total, sort_order)
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

  const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  const [itemsRows] = await pool.query(
    'SELECT * FROM order_items WHERE order_id = ? ORDER BY sort_order',
    [req.params.id]
  );

  const result = withMongoIdShim(orderRows[0]);
  result.items = itemsRows;

  return res.status(200).json({
    success: true,
    result,
    message: 'we update this document ',
  });
};

module.exports = update;
