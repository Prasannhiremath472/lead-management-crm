const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const { calculate } = require('@/helpers');
const schema = require('./schemaValidate');

const create = async (req, res) => {
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

  const { items = [], taxRate = 0, discount = 0 } = value;

  const createdBy = req.admin.id;

  const conn = await pool.getConnection();
  let insertId;
  try {
    await conn.beginTransaction();

    // Look up each item's product first, and use the DB's own name/price
    // rather than trusting the client-submitted itemName/total. This
    // guards against a client tampering with prices in the request body
    // (e.g. submitting a lower price/total than the real product price)
    // and keeps the order_items snapshot in sync with the real product.
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

    // Calculate subTotal/taxTotal/total from the server-corrected item
    // totals (post product price-validation), not the raw request body.
    let subTotal = 0;
    correctedItems.forEach((item) => {
      subTotal = calculate.add(subTotal, item.total);
    });
    const taxTotal = calculate.multiply(subTotal, taxRate / 100);
    const total = calculate.add(subTotal, taxTotal);

    const [insertResult] = await conn.query(
      `INSERT INTO orders
        (removed, created_by, number, year, date, client_id, tax_rate, sub_total, tax_total,
         total, currency, discount, credit, notes, status, payment_status)
       VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'unpaid')`,
      [
        createdBy,
        value.number,
        value.year,
        value.date,
        value.client,
        taxRate,
        subTotal,
        taxTotal,
        total,
        value.currency || 'NA',
        discount,
        value.notes || null,
        value.status || 'pending',
      ]
    );

    insertId = insertResult.insertId;

    if (correctedItems.length > 0) {
      const itemRows = correctedItems.map((item, index) => [
        insertId,
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

    const fileId = 'order-' + insertId + '.pdf';
    await conn.query('UPDATE orders SET pdf = ? WHERE id = ?', [fileId, insertId]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [insertId]);
  const [itemsRows] = await pool.query(
    'SELECT * FROM order_items WHERE order_id = ? ORDER BY sort_order',
    [insertId]
  );

  const result = withMongoIdShim(orderRows[0]);
  result.items = itemsRows;

  return res.status(200).json({
    success: true,
    result,
    message: 'Order created successfully',
  });
};

module.exports = create;
