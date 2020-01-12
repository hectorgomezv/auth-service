const { UNAUTHORIZED } = require('http-status-codes');

const {
  RESET_PASSWORD_CODE_NOT_FOUND,
  INACTIVE_USER_ERROR,
} = require('./error-messages');

const { resetPasswordValidator } = require('./validators');
const { NotFoundError, ActivationError } = require('../errors');
const { UserRepository } = require('../../repositories');

module.exports = async (data) => {
  await resetPasswordValidator(data);
  const { resetPasswordCode } = data;

  // TODO: 


  return {
    resetPasswordCode,
    email,
  };
};
