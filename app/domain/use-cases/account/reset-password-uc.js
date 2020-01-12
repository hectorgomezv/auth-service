const bcrypt = require('bcrypt');
const { UNAUTHORIZED } = require('http-status-codes');

const {
  EXPIRED_RESET_PASSWORD_CODE,
  INACTIVE_USER_ERROR,
  RESET_PASSWORD_CODE_NOT_FOUND,
} = require('./error-messages');

const { resetPasswordValidator } = require('./validators');
const { ActivationError, ForbiddenActionError, NotFoundError } = require('../errors');
const { UserRepository } = require('../../repositories');

module.exports = async (data) => {
  await resetPasswordValidator(data);

  const {
    password,
    resetPasswordCode,
  } = data;

  const user = await UserRepository.findByResetPasswordCode(resetPasswordCode);

  if (!user) {
    throw new NotFoundError(RESET_PASSWORD_CODE_NOT_FOUND);
  }

  if (!user.active) {
    throw new ActivationError(INACTIVE_USER_ERROR, `email:${user.email}`, UNAUTHORIZED);
  }

  const expiration = user.resetPasswordExpiration.getTime();

  if (expiration < Date.now()) {
    throw new ForbiddenActionError(EXPIRED_RESET_PASSWORD_CODE);
  }

  const securePassword = await bcrypt.hash(password, 10);
  const updated = await UserRepository.applyResetPassword(user._id, securePassword);

  return updated;
};
