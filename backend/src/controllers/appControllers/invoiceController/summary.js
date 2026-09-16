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

  const statuses = ['draft', 'pending', 'overdue', 'paid', 'unpaid', 'partially'];

  const [
    [totalInvoiceRows],
    [statusRows],
    [paymentStatusRows],
    [overdueRows],
    [unpaidRows],
  ] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total FROM invoices WHERE removed = 0`
    ),
    pool.query(
      `SELECT status, COUNT(*) AS count FROM invoices WHERE removed = 0 GROUP BY status`
    ),
    pool.query(
      `SELECT payment_status, COUNT(*) AS count FROM invoices WHERE removed = 0 GROUP BY payment_status`
    ),
    pool.query(
      `SELECT status, COUNT(*) AS count FROM invoices WHERE removed = 0 AND expired_date < CURDATE() GROUP BY status`
    ),
    pool.query(
      `SELECT COALESCE(SUM(total - credit), 0) AS total_amount FROM invoices WHERE removed = 0 AND payment_status IN ('unpaid', 'partially')`
    ),
  ]);

  let result = [];

  const totalInvoices = totalInvoiceRows[0] || { count: 0, total: 0 };

  const statusResult = statusRows.map((r) => ({ status: r.status, count: r.count }));
  const paymentStatusResult = paymentStatusRows.map((r) => ({
    status: r.payment_status,
    count: r.count,
  }));
  const overdueResult = overdueRows.map((r) => ({ status: r.status, count: r.count }));

  const statusResultMap = statusResult.map((item) => {
    return {
      ...item,
      percentage: Math.round((item.count / totalInvoices.count) * 100),
    };
  });

  const paymentStatusResultMap = paymentStatusResult.map((item) => {
    return {
      ...item,
      percentage: Math.round((item.count / totalInvoices.count) * 100),
    };
  });

  const overdueResultMap = overdueResult.map((item) => {
    return {
      ...item,
      status: 'overdue',
      percentage: Math.round((item.count / totalInvoices.count) * 100),
    };
  });

  statuses.forEach((status) => {
    const found = [...paymentStatusResultMap, ...statusResultMap, ...overdueResultMap].find(
      (item) => item.status === status
    );
    if (found) {
      result.push(found);
    }
  });

  const unpaid = unpaidRows;

  const finalResult = {
    total: totalInvoices?.total,
    total_undue: unpaid.length > 0 ? unpaid[0].total_amount : 0,
    type,
    performance: result,
  };

  return res.status(200).json({
    success: true,
    result: finalResult,
    message: `Successfully found all invoices for the last ${defaultType}`,
  });
};

module.exports = summary;
