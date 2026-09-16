const moment = require('moment');

const pool = require('@/db/pool');

const summary = async (Model, req, res) => {
  let defaultType = 'month';
  const { type } = req.query;

  if (type && ['week', 'month', 'year'].includes(type)) {
    defaultType = type;
  } else if (type) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Invalid type',
    });
  }

  const currentDate = moment();
  let startDate = currentDate.clone().startOf(defaultType);
  let endDate = currentDate.clone().endOf(defaultType);

  const [[totalClientsRows], [newClientsRows], [activeClientsRows]] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS count FROM clients WHERE removed = 0 AND enabled = 1`),
    pool.query(
      `SELECT COUNT(*) AS count FROM clients WHERE removed = 0 AND enabled = 1 AND created BETWEEN ? AND ?`,
      [startDate.toDate(), endDate.toDate()]
    ),
    pool.query(
      `SELECT COUNT(DISTINCT c.id) AS count FROM clients c
       JOIN invoices i ON i.client_id = c.id AND i.removed = 0
       WHERE c.removed = 0 AND c.enabled = 1`
    ),
  ]);

  const totalClients = totalClientsRows[0] ? totalClientsRows[0].count : 0;
  const totalNewClients = newClientsRows[0] ? newClientsRows[0].count : 0;
  const activeClients = activeClientsRows[0] ? activeClientsRows[0].count : 0;

  const totalActiveClientsPercentage = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
  const totalNewClientsPercentage = totalClients > 0 ? (totalNewClients / totalClients) * 100 : 0;

  return res.status(200).json({
    success: true,
    result: {
      new: Math.round(totalNewClientsPercentage),
      active: Math.round(totalActiveClientsPercentage),
    },
    message: 'Successfully get summary of new clients',
  });
};

module.exports = summary;
