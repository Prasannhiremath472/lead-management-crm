const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const read = async (req, res) => {
  // Find document by id
  const [rows] = await pool.query('SELECT * FROM offers WHERE id = ? AND removed = 0', [
    req.params.id,
  ]);

  const offer = rows[0];

  // If no results found, return document not found
  if (!offer) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  // Replicates the old `.populate('createdBy', 'name')` behavior.
  const [createdByRows] = await pool.query('SELECT id, name FROM admins WHERE id = ?', [
    offer.created_by,
  ]);

  // Replicates the old mongoose-autopopulate behavior on `client`.
  const [clientRows] = await pool.query('SELECT * FROM clients WHERE id = ?', [offer.client_id]);

  const [itemRows] = await pool.query(
    'SELECT * FROM offer_items WHERE offer_id = ? ORDER BY sort_order',
    [req.params.id]
  );

  const result = { ...offer };
  if (createdByRows[0]) {
    result.createdBy = withMongoIdShim(createdByRows[0]);
  }
  if (clientRows[0]) {
    result.client = withMongoIdShim(clientRows[0]);
  }
  result.items = itemRows;

  // Return success resposne
  return res.status(200).json({
    success: true,
    result: withMongoIdShim(result),
    message: 'we found this document ',
  });
};

module.exports = read;
