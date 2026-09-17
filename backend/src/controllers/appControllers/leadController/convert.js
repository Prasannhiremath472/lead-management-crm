const pool = require('@/db/pool');
const { withMongoIdShim } = require('@/db/queryBuilder');

const convert = async (req, res) => {
  const [leadRows] = await pool.query('SELECT * FROM leads WHERE id = ? AND removed = 0', [
    req.params.id,
  ]);

  const lead = leadRows[0];

  if (!lead) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  if (lead.converted_to_client_id) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Lead already converted',
    });
  }

  const conn = await pool.getConnection();
  let clientId;
  try {
    await conn.beginTransaction();

    const [insertResult] = await conn.query(
      `INSERT INTO clients
        (removed, enabled, name, phone, email, created_by, assigned)
       VALUES (0, 1, ?, ?, ?, ?, ?)`,
      [lead.name, lead.phone, lead.email, req.admin.id, lead.assigned]
    );

    clientId = insertResult.insertId;

    await conn.query(
      `UPDATE leads SET converted_to_client_id = ?, converted_at = NOW(), status = 'converted' WHERE id = ?`,
      [clientId, lead.id]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [clientRows] = await pool.query('SELECT * FROM clients WHERE id = ?', [clientId]);

  return res.status(200).json({
    success: true,
    result: withMongoIdShim(clientRows[0]),
    message: 'Lead converted to client successfully',
  });
};

module.exports = convert;
