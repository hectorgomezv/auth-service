const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UNAUTHORIZED } = require('http-status-codes');

const { refreshSessionValidator } = require('./validators');

const {
  ActivationError,
  ForbiddenActionError,
  NotFoundError,
} = require('../errors');

const { UserRepository } = require('../../repositories');

const {
  EXPIRED_TOKEN,
  INACTIVE_USER_ERROR,
  SESSION_NOT_FOUND,
  USER_NOT_FOUND,
} = require('./error-messages');

const {
  JWT_SECRET,
  TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} = process.env;

/**
 * Checks the refresh token passed is valid.
 * @param {User} user user to check.
 * @param {String} refreshToken refreshToken to check.
 */
const checkRefreshToken = async (user, refreshToken) => {
  const { _id, sessions } = user;
  const isRefreshTokenValid = await bcrypt.compare(refreshToken, sessions[0].refreshToken);

  if (!isRefreshTokenValid) {
    throw new NotFoundError(SESSION_NOT_FOUND, `user:${_id}`, UNAUTHORIZED);
  }

  const limit = Date.now() - Number(REFRESH_TOKEN_EXPIRATION);
  const isRefreshTokenExpired = sessions[0].createdAt.getTime() < limit;

  if (isRefreshTokenExpired) {
    throw new ForbiddenActionError(EXPIRED_TOKEN, `user:${_id}`, UNAUTHORIZED);
  }
};

/**
 * Checks the user is valid.
 * @param {User} user user to check.
 */
const checkUser = async (user) => {
  if (!user || !user.sessions) {
    throw new NotFoundError(USER_NOT_FOUND, '', UNAUTHORIZED);
  }

  if (!user.active) {
    throw new ActivationError(INACTIVE_USER_ERROR, `user:${user._id}`, UNAUTHORIZED);
  }

  if (user.sessions.length === 0) {
    throw new NotFoundError(SESSION_NOT_FOUND, `user:${user._id}`, UNAUTHORIZED);
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
 * Executes a refresh session action.
 * @param {Object} data input data.
 * @returns {Object} object containing a new access token.
 */
module.exports = async (data) => {
  await refreshSessionValidator(data);
  const { id: userId } = jwt.verify(data.accessToken, JWT_SECRET);
  const user = await UserRepository.findByIdAndFilterSessionByAccessToken(userId, data.accessToken);
  await checkUser(user, data.refreshToken);
  await checkRefreshToken(user, data.refreshToken);
  const accessToken = generateAccessToken(user);
  const encryptedRefreshToken = await bcrypt.hash(data.refreshToken, 10);

  await UserRepository.addSession(user._id, {
    accessToken,
    refreshToken: encryptedRefreshToken,
    createdAt: new Date(),
  });

  return {
    data: {
      accessToken,
      expiresIn: Number(TOKEN_EXPIRATION),
    },
  };
};
