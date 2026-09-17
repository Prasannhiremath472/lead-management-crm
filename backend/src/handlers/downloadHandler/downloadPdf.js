const custom = require('@/controllers/pdfController');
const pool = require('@/db/pool');
const { getModel } = require('@/db/models');
const { withMongoIdShim } = require('@/db/queryBuilder');

// PDF templates (Invoice.pug/Payment.pug/Quote.pug/Offer.pug/Order.pug) were
// authored against the old Mongoose camelCase field names (subTotal,
// taxTotal, taxRate, expiredDate, item.itemName) and expect the same
// nested-object shape the app's read/list controllers already build to
// replicate the old Mongoose autopopulate behavior (see
// invoiceController/read.js). The MySQL columns are snake_case, so alias
// them to the casing the templates already use, rather than rewriting
// every .pug file.
function withPugCasingAliases(row) {
  if (row.sub_total !== undefined) row.subTotal = row.sub_total;
  if (row.tax_total !== undefined) row.taxTotal = row.tax_total;
  if (row.tax_rate !== undefined) row.taxRate = row.tax_rate;
  if (row.expired_date !== undefined) row.expiredDate = row.expired_date;
  return row;
}

function withItemCasingAliases(items) {
  return items.map((item) => {
    if (item.item_name !== undefined) item.itemName = item.item_name;
    return item;
  });
}

async function enrichForPdf(modelName, result) {
  withPugCasingAliases(result);
  if (result.client_id) {
    const [clientRows] = await pool.query('SELECT * FROM clients WHERE id = ?', [result.client_id]);
    if (clientRows[0]) result.client = withMongoIdShim(clientRows[0]);
  }
  if (result.created_by) {
    const [adminRows] = await pool.query('SELECT id, name FROM admins WHERE id = ?', [result.created_by]);
    if (adminRows[0]) result.createdBy = withMongoIdShim(adminRows[0]);
  }
  if (modelName === 'Invoice') {
    const [itemRows] = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order',
      [result.id]
    );
    result.items = withItemCasingAliases(itemRows);
  } else if (modelName === 'Quote') {
    const [itemRows] = await pool.query(
      'SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order',
      [result.id]
    );
    result.items = withItemCasingAliases(itemRows);
  } else if (modelName === 'Offer') {
    const [itemRows] = await pool.query(
      'SELECT * FROM offer_items WHERE offer_id = ? ORDER BY sort_order',
      [result.id]
    );
    result.items = withItemCasingAliases(itemRows);
  } else if (modelName === 'Order') {
    const [itemRows] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY sort_order',
      [result.id]
    );
    result.items = withItemCasingAliases(itemRows);
  }
  return result;
}

module.exports = downloadPdf = async (req, res, { directory, id }) => {
  try {
    const modelName = directory.slice(0, 1).toUpperCase() + directory.slice(1);
    let modelDef;
    try {
      modelDef = getModel(modelName);
    } catch (e) {
      modelDef = null;
    }

    if (modelDef) {
      const [rows] = await pool.query(`SELECT * FROM ${modelDef.tableName} WHERE id = ?`, [id]);
      let result = rows[0];

      // Throw error if no result (zero rows found is the SQL equivalent of
      // Mongoose's "no document" / invalid ObjectId case)
      if (!result) {
        throw { name: 'ValidationError' };
      }

      result = await enrichForPdf(modelName, result);

      // Continue process if result is returned

      const fileId = modelName.toLowerCase() + '-' + result.id + '.pdf';
      const folderPath = modelName.toLowerCase();
      const targetLocation = `src/public/download/${folderPath}/${fileId}`;
      await custom.generatePdf(
        modelName,
        { filename: folderPath, format: 'A4', targetLocation },
        result,
        async () => {
          return res.download(targetLocation, (error) => {
            if (error)
              return res.status(500).json({
                success: false,
                result: null,
                message: "Couldn't find file",
                error: error.message,
              });
          });
        }
      );
    } else {
      return res.status(404).json({
        success: false,
        result: null,
        message: `Model '${modelName}' does not exist`,
      });
    }
  } catch (error) {
    // If error is thrown due to required validations / not-found row
    if (error.name == 'ValidationError') {
      return res.status(400).json({
        success: false,
        result: null,
        error: error.message,
        message: 'Required fields are not supplied',
      });
    } else if (error.name == 'BSONTypeError') {
      // Kept for parity with the previous Mongoose-based error handling.
      // Under SQL a malformed id simply fails the query or matches zero
      // rows, which is handled by the ValidationError branch above.
      return res.status(400).json({
        success: false,
        result: null,
        error: error.message,
        message: 'Invalid ID',
      });
    } else {
      // Server Error
      return res.status(500).json({
        success: false,
        result: null,
        error: error.message,
        message: error.message,
        controller: 'downloadPDF.js',
      });
    }
  }
};
