const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const productModel = require('@/db/models/productModel');
const read = require('./read');
const paginatedList = require('./paginatedList');

function modelController() {
  const methods = createCRUDController('Product');
  methods.read = (req, res) => read(productModel, req, res);
  methods.list = (req, res) => paginatedList(productModel, req, res);
  return methods;
}

module.exports = modelController();
