const { getModel } = require('@/db/models');

const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./remove');
const search = require('./search');
const filter = require('./filter');
const summary = require('./summary');
const listAll = require('./listAll');
const paginatedList = require('./paginatedList');

const createCRUDController = (modelName) => {
  const modelDef = getModel(modelName);

  let crudMethods = {
    create: (req, res) => create(modelDef, req, res),
    read: (req, res) => read(modelDef, req, res),
    update: (req, res) => update(modelDef, req, res),
    delete: (req, res) => remove(modelDef, req, res),
    list: (req, res) => paginatedList(modelDef, req, res),
    listAll: (req, res) => listAll(modelDef, req, res),
    search: (req, res) => search(modelDef, req, res),
    filter: (req, res) => filter(modelDef, req, res),
    summary: (req, res) => summary(modelDef, req, res),
  };
  return crudMethods;
};

module.exports = createCRUDController;
