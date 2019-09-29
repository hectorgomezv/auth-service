const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  fullName: Joi.string(),
  avatarUrl: Joi.string().uri(),
  role: Joi.string().required(),
});

module.exports = async (data) => schema.validateAsync(data);
