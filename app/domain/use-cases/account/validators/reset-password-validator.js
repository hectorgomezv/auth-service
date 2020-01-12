const Joi = require('@hapi/joi');

/**
 * Validates the passed reset password data.
 * @param {String} data.resetPasswordCode uuid reset password code.
 * @param {String} data.password password.
 * @param {String} data.repeatedPassword repeated password.
 */

const schema = Joi.object().keys({
  resetPasswordCode: Joi.string().guid().required().label('resetPasswordCode'),
  password: Joi.string().required().label('password'),
  repeatedPassword: Joi.string().required().valid(Joi.ref('password')).label('repeatedPassword'),
});

module.exports = async (data) => schema.validateAsync(data);
