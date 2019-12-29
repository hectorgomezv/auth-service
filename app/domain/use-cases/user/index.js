const createUser = require('./create-user-uc');
const getUser = require('./get-user-uc');
const getUsers = require('./get-users-uc');
const deactivateUser = require('./deactivate-user-uc');
const setActivation = require('./set-activation-uc');

module.exports = {
  createUser,
  getUser,
  getUsers,
  deactivateUser,
  setActivation,
};
