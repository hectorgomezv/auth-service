const { v4: uuidv4 } = require('uuid');
const { UNAUTHORIZED } = require('http-status-codes');

const {
  USER_NOT_FOUND,
  INACTIVE_USER_ERROR,
} = require('./error-messages');

const { emailValidator } = require('./validators');
const { NotFoundError, ActivationError } = require('../errors');
const {
  EmailRepository,
  UserRepository,
} = require('../../repositories');

const { RESET_PASSWORD_CODE_EXPIRATION } = process.env;

/**
* Verifies the passed email belong to a user who is active.
* @param {String} email email
* @throws {NotFoundError} if the user does not exist.
* @throws {ActivationError} if the user is not currently active.
* @returns {User} user found.
*/
const checkUser = async (email) => {
  const user = await UserRepository.findByEmail(email);

  if (!user) {
    throw new NotFoundError(USER_NOT_FOUND);
  }

  if (!user.active) {
    throw new ActivationError(INACTIVE_USER_ERROR, `email:${email}`, UNAUTHORIZED);
  }

  return user;
};

module.exports = async (data) => {
  const { email } = data;
  await emailValidator(email);
  const user = await checkUser(email);
  const resetPasswordCode = uuidv4();
  const expiration = new Date(Date.now() + Number(RESET_PASSWORD_CODE_EXPIRATION));
  await UserRepository.generateResetPasswordCode(user._id, resetPasswordCode, expiration);
  await EmailRepository.sendResetPassword(email, resetPasswordCode);
};
