const Joi = require('@hapi/joi');
const { AuthenticationError } = require('../errors');

module.exports = async () => {
  const a = 'hi';
  await Joi.number().validateAsync(a);
  throw new AuthenticationError('testMsg', 'testPointer', 'testCode', { foo: 'bar' });
};
