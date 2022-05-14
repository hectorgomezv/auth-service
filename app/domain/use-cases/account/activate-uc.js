const bcrypt = require('bcrypt');

const { activationValidator } = require('./validators');

const {
  ACTIVATION_CODE_NOT_FOUND,
  ALREADY_ACTIVE_ERROR,
} = require('./error-messages');

const {
  NotFoundError,
  ActivationError,
} = require('../errors');

const { UserRepository } = require('../../repositories');

/**
 * Activates an user by its activationCode.
 * @param {String} activationCode code to use.
 * @param {String} password password.
 * @param {String} repeatedPassword password.
 * @throws ActivationError when the activation fails.
 */
const execute = async (data) => {
  await activationValidator(data);
  const { activationCode, password } = data;
  const user = await UserRepository.findByActivationCode(activationCode);

  if (!user) {
    throw new NotFoundError(ACTIVATION_CODE_NOT_FOUND);
  }

  const { _id, active } = user;
  if (active) {
    throw new ActivationError(ALREADY_ACTIVE_ERROR);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activeUser = await UserRepository.activate(_id, hashedPassword);

  return {
    data: activeUser,
  };
};

module.exports = execute;
