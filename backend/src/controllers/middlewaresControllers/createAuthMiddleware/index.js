const isValidAuthToken = require('./isValidAuthToken');
const login = require('./login');
const logout = require('./logout');
const forgetPassword = require('./forgetPassword');
const resetPassword = require('./resetPassword');

const createAuthMiddleware = (userModel) => {
  let authMethods = {};

  authMethods.isValidAuthToken = (req, res, next) => isValidAuthToken(req, res, next);

  authMethods.login = (req, res) => login(req, res);

  authMethods.forgetPassword = (req, res) => forgetPassword(req, res);

  authMethods.resetPassword = (req, res) => resetPassword(req, res);

  authMethods.logout = (req, res) => logout(req, res);

  return authMethods;
};

module.exports = createAuthMiddleware;
