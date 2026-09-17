const Client = require('./clientModel');
const Invoice = require('./invoiceModel');
const Payment = require('./paymentModel');
const Admin = require('./adminModel');
const AdminPassword = require('./adminPasswordModel');
const AdminSession = require('./adminSessionModel');
const Setting = require('./settingModel');
const ProductCategory = require('./productCategoryModel');
const Product = require('./productModel');
const ExpenseCategory = require('./expenseCategoryModel');
const Expense = require('./expenseModel');
const Company = require('./companyModel');
const Lead = require('./leadModel');
const Quote = require('./quoteModel');
const Offer = require('./offerModel');
const Order = require('./orderModel');

// Static registry replacing the old glob-based discovery in
// src/models/utils/index.js. modelName is the capitalized key used
// throughout the generic CRUD controller and route wiring.
const registry = {
  Client,
  Invoice,
  Payment,
  Admin,
  AdminPassword,
  AdminSession,
  Setting,
  ProductCategory,
  Product,
  ExpenseCategory,
  Expense,
  Company,
  Lead,
  Quote,
  Offer,
  Order,
};

// Entities exposed through the generic app-entity REST auto-wiring
// (routes/appRoutes/appApi.js). Admin/AdminPassword/AdminSession are
// intentionally excluded here — Admin keeps its narrower hand-wired
// surface in coreRoutes/coreApi.js, matching current behavior.
const routesList = [
  { entity: 'client', modelName: 'Client', controllerName: 'clientController' },
  { entity: 'invoice', modelName: 'Invoice', controllerName: 'invoiceController' },
  { entity: 'payment', modelName: 'Payment', controllerName: 'paymentController' },
  { entity: 'productCategory', modelName: 'ProductCategory', controllerName: 'productCategoryController' },
  { entity: 'product', modelName: 'Product', controllerName: 'productController' },
  { entity: 'expenseCategory', modelName: 'ExpenseCategory', controllerName: 'expenseCategoryController' },
  { entity: 'expense', modelName: 'Expense', controllerName: 'expenseController' },
  { entity: 'company', modelName: 'Company', controllerName: 'companyController' },
  { entity: 'lead', modelName: 'Lead', controllerName: 'leadController' },
  { entity: 'quote', modelName: 'Quote', controllerName: 'quoteController' },
  { entity: 'offer', modelName: 'Offer', controllerName: 'offerController' },
  { entity: 'order', modelName: 'Order', controllerName: 'orderController' },
];

const modelsFiles = Object.keys(registry);

function getModel(modelName) {
  const modelDef = registry[modelName];
  if (!modelDef) {
    throw new Error(`Model "${modelName}" is not registered`);
  }
  return modelDef;
}

module.exports = {
  registry,
  routesList,
  modelsFiles,
  getModel,
};
