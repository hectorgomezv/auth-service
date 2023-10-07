import Joi from 'joi';

/**
 * Validates the passed email.
 * @param {String} email email to validate
 */

const schema = Joi.string().email().required().label('email');

export default async (data) => schema.validateAsync(data);
