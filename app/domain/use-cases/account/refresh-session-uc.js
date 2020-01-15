const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UNAUTHORIZED } = require('http-status-codes');

const { refreshSessionValidator } = require('./validators');
const { NotFoundError } = require('../errors');
const { UserRepository } = require('../../repositories');

const {
  EXPIRED_TOKEN,
  INACTIVE_USER_ERROR,
  SESSION_NOT_FOUND,
  USER_NOT_FOUND,
} = require('./error-messages');

const {
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRATION,
} = process.env;

module.exports = async (data) => {
  await refreshSessionValidator(data);

  const {
    accessToken,
    refreshToken,
  } = data;

  const { _id } = jwt.verify(accessToken, JWT_SECRET);
  const user = await UserRepository.findByIdAndFilterSessionByAccessToken(_id, accessToken);

  if (!user || !user.sessions || user.sessions.length === 0) {
    throw new NotFoundError(USER_NOT_FOUND, `user:${_id}`, UNAUTHORIZED);
  }

  const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.sessions[0].refreshToken);

  if (!isRefreshTokenValid) {
    throw new NotFoundError(SESSION_NOT_FOUND, `user:${_id}`, UNAUTHORIZED);
  }
};
