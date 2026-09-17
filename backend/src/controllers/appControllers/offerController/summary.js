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

  // Offer reuses Quote's 7-value status vocabulary for consistency (no
  // offerSettings.json offer_status seed existed prior to this change, so
  // these are hardcoded here rather than read from settings). Offer has no
  // payment_status/credit and no expired_date-based overdue concept.
  const statuses = ['draft', 'pending', 'sent', 'negotiation', 'accepted', 'declined', 'cancelled'];

  const [[totalOfferRows], [statusRows]] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total FROM offers WHERE removed = 0`
    ),
    pool.query(`SELECT status, COUNT(*) AS count FROM offers WHERE removed = 0 GROUP BY status`),
  ]);

  const totalOffers = totalOfferRows[0] || { count: 0, total: 0 };

  const statusResultMap = statusRows.map((r) => ({
    status: r.status,
    count: r.count,
    percentage: totalOffers.count > 0 ? Math.round((r.count / totalOffers.count) * 100) : 0,
  }));

  const result = [];
  statuses.forEach((status) => {
    const found = statusResultMap.find((item) => item.status === status);
    if (found) {
      result.push(found);
    }
  });

  const finalResult = {
    total: totalOffers?.total,
    type,
    performance: result,
  };

  return res.status(200).json({
    success: true,
    result: finalResult,
    message: `Successfully found all offers for the last ${defaultType}`,
  });
};

module.exports = summary;
