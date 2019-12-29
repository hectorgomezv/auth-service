const getUserController = require('./get-user-controller');
const getUsersController = require('./get-users-controller');
const createUserController = require('./create-user-controller');
const deactivateUserController = require('./deactivate-user-controller');
const activationController = require('./activation-controller');

module.exports = {
  getUserController,
  getUsersController,
  createUserController,
  deactivateUserController,
  activationController,
};
