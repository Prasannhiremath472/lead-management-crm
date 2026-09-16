const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const clientModel = require('@/db/models/clientModel');

const summary = require('./summary');

function modelController() {
  const methods = createCRUDController('Client');

  methods.summary = (req, res) => summary(clientModel, req, res);
  return methods;
}

module.exports = modelController();
