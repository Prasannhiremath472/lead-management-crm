const moment = require('moment');

const pool = require('@/db/pool');
const { loadSettings } = require('@/middlewares/settings');

const summary = async (req, res) => {
  let defaultType = 'month';

  const { type } = req.query;

  const settings = await loadSettings();

  if (type) {
    if (['week', 'month', 'year'].includes(type)) {
      defaultType = type;
    } else {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid type',
      });
    }
  }

  const currentDate = moment();
  let startDate = currentDate.clone().startOf(defaultType);
  let endDate = currentDate.clone().endOf(defaultType);

  // get total amount of invoices
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total FROM payments WHERE removed = 0`
  );

  return res.status(200).json({
    success: true,
    result: rows.length > 0 ? rows[0] : { count: 0, total: 0 },
    message: `Successfully fetched the summary of payment invoices for the last ${defaultType}`,
  });
};

module.exports = summary;
