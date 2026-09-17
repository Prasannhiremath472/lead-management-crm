const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const expenseModel = require('@/db/models/expenseModel');
const read = require('./read');
const paginatedList = require('./paginatedList');

function modelController() {
  const methods = createCRUDController('Expense');
  methods.read = (req, res) => read(expenseModel, req, res);
  methods.list = (req, res) => paginatedList(expenseModel, req, res);
  return methods;
}

module.exports = modelController();
