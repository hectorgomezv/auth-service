const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { loginValidator } = require('./validators');
const { AuthenticationError } = require('../errors');
const { UserRepository } = require('../../repositories');

const {
  JWT_SECRET,
  TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} = process.env;

/**
 * Checks the input password against the hashed password.
 * @param {String} savedPasswordHash saved password hash.
 * @param {String} password input password to check.
 */
const checkPassword = async (savedPasswordHash, password) => {
  const match = await bcrypt.compare(password, savedPasswordHash);
  if (!match) {
    throw new AuthenticationError('Bad username or password');
  }
};

/**
 * Issues an accessToken containing the info of the passed user.
 * @param {User} user user to use.
 */
const generateAccessToken = (user) => jwt.sign({
  id: user._id,
  email: user.email,
  roles: user.roles,
}, JWT_SECRET, { expiresIn: Number(TOKEN_EXPIRATION) });

/**
 * Issues an refreshToken containing only the user id and email.
 * @param {User} user user to use.
 */
const generateRefreshToken = (user) => jwt.sign({
  id: user._id,
  email: user.email,
}, JWT_SECRET, { expiresIn: Number(REFRESH_TOKEN_EXPIRATION) });

module.exports = async (data) => {
  await loginValidator(data);

  const { email, password } = data;
  const user = await UserRepository.findByEmail(email);

  if (!user) {
    throw new AuthenticationError('Bad username or password');
  }

  const { active, password: savedPasswordHash } = user;
  if (!active) {
    throw new AuthenticationError('Inactive user', `email:${email}`);
  }
  await checkPassword(savedPasswordHash, password);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const encryptedRefreshToken = await bcrypt.hash(refreshToken, 10);
  await UserRepository.addSession(user._id, {
    accessToken,
    refreshToken: encryptedRefreshToken,
    createdAt: new Date(),
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: Number(TOKEN_EXPIRATION),
    user,
  };
};
