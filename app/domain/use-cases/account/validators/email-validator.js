const Joi = require('@hapi/joi');

/**
 * Validates the passed email.
 * @param {String} email email to validate
 */

const schema = Joi.string().email().required().label('email');

module.exports = async (data) => schema.validateAsync(data);