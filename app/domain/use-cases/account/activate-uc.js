const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');

const {
  ACTIVATION_CODE_NOT_FOUND,
  ALREADY_ACTIVE_ERROR,
} = require('./error-messages');

const {
  NotFoundError,
  ActivationError,
} = require('../errors');

const { UserRepository } = require('../../../../app/domain/repositories');

/**
 * Validates the passed activation code and passwords.
 * The activation code should be a valid uuid.
 * @param {String} data.activationCode uuid activation code.
 * @param {String} data.password password.
 * @param {String} data.repeatedPassword repeated password.
 */
const validateData = async (data) => Joi.object().keys({
  activationCode: Joi.string().guid().required().label('activationCode'),
  password: Joi.string().required().label('password'),
  repeatedPassword: Joi.string().required().valid(Joi.ref('password')).label('repeatedPassword'),
}).validateAsync(data);

/**
 * Activates an user by its activationCode.
 * @param {String} activationCode code to use.
 * @param {String} password password.
 * @param {String} repeatedPassword password.
 * @throws ActivationError when the activation fails.
 */
const execute = async (activationCode, password, repeatedPassword) => {
  await validateData({ activationCode, password, repeatedPassword });

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
