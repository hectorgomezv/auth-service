const _ = require('lodash');
const jwt = require('jsonwebtoken');
const { InvalidJWTError } = require('../controllers/errors');

const { JWT_SECRET } = process.env;

/**
 * Extracts the JWT sent in the request headers.
 * @returns {Auth} Auth object.
 * @param {Object} headers request headers.
 * @returns {String} token extracted from the headers.
 * @throws {InvalidJWTError} if the Authorization header is not sent.
 */
const extractAccessToken = (headers) => {
  const authorization = _.get(headers, 'authorization');
  if (!authorization || !_.isString(authorization) || !authorization.startsWith('Bearer ')) {
    throw new InvalidJWTError('Authorization required');
  }

  return authorization.slice(7, authorization.length);
};

/**
 * Verifies the JWT sent in the request.
 * @param {Object} headers request headers.
 * @returns {Auth} Auth object.
 * @throws {InvalidJWTError} if the Authorization header is not valid.
 */
const processAuth = (headers) => {
  try {
    const token = extractAccessToken(headers);
    const {
      id,
      email,
      role,
      exp,
    } = jwt.verify(token, JWT_SECRET);

    return {
      id,
      email,
      role,
      exp,
      accessToken: token,
    };
  } catch (err) {
    throw new InvalidJWTError(err.message);
  }
};

/**
 * Adds auth object with user credentials to the request object.
 * @param {Object} req request object.
 * @param {Object} res response object.
 * @param {Function} next next function in the pipeline.
 */
const addAuthHeader = (req, res, next) => {
  try {
    const { headers } = req;
    req.auth = processAuth(headers);
  } catch (err) {
    return next(err);
  }

  return next();
};

module.exports = {
  addAuthHeader,
};
