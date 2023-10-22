import Joi from 'joi';

const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export default async (data) => schema.validateAsync(data);
