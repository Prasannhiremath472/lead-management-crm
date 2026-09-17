const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const convert = require('./convert');

function modelController() {
  const methods = createCRUDController('Lead');
  methods.convert = (req, res) => convert(req, res);
  return methods;
}

module.exports = modelController();
