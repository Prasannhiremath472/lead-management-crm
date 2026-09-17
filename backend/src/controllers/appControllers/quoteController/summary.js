const pool = require('@/db/pool');

const summary = async (req, res) => {
  let defaultType = 'month';

  const { type } = req.query;

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

  // Quote's status vocabulary (see src/setup/defaultSettings/quoteSettings.json,
  // setting key quote_status). Quote has no payment_status/credit and no
  // expired_date-based overdue concept exposed in this summary, unlike Invoice.
  const statuses = ['draft', 'pending', 'sent', 'negotiation', 'accepted', 'declined', 'cancelled'];

  const [[totalQuoteRows], [statusRows]] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total FROM quotes WHERE removed = 0`
    ),
    pool.query(`SELECT status, COUNT(*) AS count FROM quotes WHERE removed = 0 GROUP BY status`),
  ]);

  const totalQuotes = totalQuoteRows[0] || { count: 0, total: 0 };

  const statusResultMap = statusRows.map((r) => ({
    status: r.status,
    count: r.count,
    percentage: totalQuotes.count > 0 ? Math.round((r.count / totalQuotes.count) * 100) : 0,
  }));

  const result = [];
  statuses.forEach((status) => {
    const found = statusResultMap.find((item) => item.status === status);
    if (found) {
      result.push(found);
    }
  });

  const finalResult = {
    total: totalQuotes?.total,
    type,
    performance: result,
  };

  return res.status(200).json({
    success: true,
    result: finalResult,
    message: `Successfully found all quotes for the last ${defaultType}`,
  });
};

module.exports = summary;
