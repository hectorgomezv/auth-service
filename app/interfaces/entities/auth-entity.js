import { get, isString } from 'lodash-es';
import jwt from 'jsonwebtoken';
import InvalidJWTError from '../controllers/errors/invalid-jwt-error.js';

const { JWT_SECRET } = process.env;

/**
 * Extracts the JWT sent in the request headers.
 * @returns {Auth} Auth object.
 * @param {Object} headers request headers.
 * @returns {String} token extracted from the headers.
 * @throws {InvalidJWTError} if the Authorization header is not sent.
 */
const extractAccessToken = (headers) => {
  const authorization = get(headers, 'authorization');
  if (
    !authorization ||
    !isString(authorization) ||
    !authorization.startsWith('Bearer ')
  ) {
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
    const { id, email, role, exp } = jwt.verify(token, JWT_SECRET);

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

export default {
  processAuth,
};
