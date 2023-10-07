import Joi from 'joi';

const schema = Joi.object()
  .keys({
    email: Joi.string().email().required(),
    fullName: Joi.string(),
    avatarUrl: Joi.string().uri(),
    role: Joi.string().required(),
  })
  .required();

export default async (data) => schema.validateAsync(data);
