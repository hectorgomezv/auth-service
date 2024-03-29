import Joi from 'joi';

/**
 * Validates the passed activation code and passwords.
 * The activation code should be a valid uuid.
 * @param {String} data.activationCode uuid activation code.
 * @param {String} data.password password.
 * @param {String} data.repeatedPassword repeated password.
 */

const schema = Joi.object().keys({
  activationCode: Joi.string().guid().required().label('activationCode'),
  password: Joi.string().required().label('password'),
  repeatedPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .label('repeatedPassword'),
});

export default async (data) => schema.validateAsync(data);
