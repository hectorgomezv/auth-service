const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { loginValidator } = require('./validators');

const {
  BAD_LOGIN_ERROR,
  INACTIVE_USER_ERROR,
} = require('./error-messages');

const { AuthenticationError } = require('../errors');
const { UserRepository } = require('../../repositories');

const {
  JWT_SECRET,
  TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} = process.env;

/**
 * Verifies the passed email belong to a user who is active.
 * @param {Object} data input data.
 * @throws {AuthenticationError} if the user does not exist.
 * @throws {AuthenticationError} if the user is not currently active.
 * @returns {User} user found.
 */
const checkUser = async (data) => {
  const user = await UserRepository.findByEmail(data.email);

  if (!user) {
    throw new AuthenticationError(BAD_LOGIN_ERROR);
  }

  if (!user.active) {
    throw new AuthenticationError(INACTIVE_USER_ERROR, `email:${data.email}`);
  }

  return user;
};

/**
 * Checks the input password against the hashed password.
 * @param {String} savedPasswordHash saved password hash.
 * @param {String} password input password to check.
 */
const checkPassword = async (savedPasswordHash, password) => {
  const match = await bcrypt.compare(password, savedPasswordHash);
  if (!match) {
    throw new AuthenticationError(BAD_LOGIN_ERROR);
  }
};

/**
 * Issues an accessToken containing the info of the passed user.
 * @param {User} user user to use.
 */
const generateAccessToken = (user) => jwt.sign({
  id: user._id,
  email: user.email,
  role: user.role,
}, JWT_SECRET, { expiresIn: Number(TOKEN_EXPIRATION) });

/**
 * Issues an refreshToken containing only the user id and email.
 * @param {User} user user to use.
 */
const generateRefreshToken = (user) => jwt.sign({
  id: user._id,
  email: user.email,
}, JWT_SECRET, { expiresIn: Number(REFRESH_TOKEN_EXPIRATION) });

/**
 * Executes a login action with the passed data.
 * @param {Object} data input data.
 * @returns {Object} object containing tokens and user profile.
 */
const execute = async (data) => {
  await loginValidator(data);
  const user = await checkUser(data);
  await checkPassword(user.password, data.password);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const encryptedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await UserRepository.addSession(user._id, {
    accessToken,
    refreshToken: encryptedRefreshToken,
    createdAt: new Date(),
  });

  return {
    data: {
      accessToken,
      refreshToken,
      expiresIn: Number(TOKEN_EXPIRATION),
      user,
    },
  };
};

module.exports = execute;
