import Joi from 'joi';

/**
 * Validates the passed refresh session data.
 * @param {String} data.accessToken access token.
 * @param {String} data.refreshToken refresh token.
 */

const schema = Joi.object()
  .keys({
    accessToken: Joi.string().required().label('accessToken'),
    refreshToken: Joi.string().required().label('refreshToken'),
  })
  .required();

export default async (data) => schema.validateAsync(data);
