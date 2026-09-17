const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');
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

  const createdBy = req.admin.id;

  const conn = await pool.getConnection();
  let insertId;
  try {
    await conn.beginTransaction();

    const [insertResult] = await conn.query(
      `INSERT INTO offers
        (removed, created_by, number, year, content, date, expired_date, client_id,
         tax_rate, sub_total, tax_total, total, currency, discount, notes, status)
       VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        createdBy,
        value.number,
        value.year,
        value.content || null,
        value.date,
        value.expiredDate,
        value.client,
        taxRate,
        subTotal,
        taxTotal,
        total,
        value.currency || 'NA',
        discount,
        value.notes || null,
        value.status,
      ]
    );

    insertId = insertResult.insertId;

    if (items.length > 0) {
      const itemRows = items.map((item, index) => [
        insertId,
        item.itemName,
        item.description || null,
        item.quantity,
        item.price,
        item.total,
        index,
      ]);
      await conn.query(
        `INSERT INTO offer_items (offer_id, item_name, description, quantity, price, total, sort_order)
         VALUES ?`,
        [itemRows]
      );
    }

    const fileId = 'offer-' + insertId + '.pdf';
    await conn.query('UPDATE offers SET pdf = ? WHERE id = ?', [fileId, insertId]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  // Non-transactional side effect, matching current (pre-rewrite) behavior
  // where this call is fire-and-forget after the document is saved.
  increaseBySettingKey({
    settingKey: 'last_offer_number',
  });

  const [offerRows] = await pool.query('SELECT * FROM offers WHERE id = ?', [insertId]);
  const [itemsRows] = await pool.query(
    'SELECT * FROM offer_items WHERE offer_id = ? ORDER BY sort_order',
    [insertId]
  );

  const result = withMongoIdShim(offerRows[0]);
  result.items = itemsRows;

  return res.status(200).json({
    success: true,
    result,
    message: 'Offer created successfully',
  });
};

module.exports = create;
