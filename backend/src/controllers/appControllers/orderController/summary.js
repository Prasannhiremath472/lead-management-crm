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

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentStatuses = ['unpaid', 'paid', 'partially'];

  const [[totalOrderRows], [statusRows], [paymentStatusRows]] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total FROM orders WHERE removed = 0`
    ),
    pool.query(`SELECT status, COUNT(*) AS count FROM orders WHERE removed = 0 GROUP BY status`),
    pool.query(
      `SELECT payment_status, COUNT(*) AS count FROM orders WHERE removed = 0 GROUP BY payment_status`
    ),
  ]);

  const totalOrders = totalOrderRows[0] || { count: 0, total: 0 };

  const statusResult = statusRows.map((r) => ({ status: r.status, count: r.count }));
  const paymentStatusResult = paymentStatusRows.map((r) => ({
    status: r.payment_status,
    count: r.count,
  }));

  const statusResultMap = statusResult.map((item) => ({
    ...item,
    percentage: Math.round((item.count / totalOrders.count) * 100),
  }));

  const paymentStatusResultMap = paymentStatusResult.map((item) => ({
    ...item,
    percentage: Math.round((item.count / totalOrders.count) * 100),
  }));

  const statusPerformance = [];
  statuses.forEach((status) => {
    const found = statusResultMap.find((item) => item.status === status);
    if (found) {
      statusPerformance.push(found);
    }
  });

  const paymentStatusPerformance = [];
  paymentStatuses.forEach((status) => {
    const found = paymentStatusResultMap.find((item) => item.status === status);
    if (found) {
      paymentStatusPerformance.push(found);
    }
  });

  const finalResult = {
    total: totalOrders?.total,
    type,
    performance: statusPerformance,
    paymentPerformance: paymentStatusPerformance,
  };

  return res.status(200).json({
    success: true,
    result: finalResult,
    message: `Successfully found all orders for the last ${defaultType}`,
  });
};

module.exports = summary;
