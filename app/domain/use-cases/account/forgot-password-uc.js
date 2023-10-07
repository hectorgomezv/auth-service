import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import {
  INACTIVE_USER_ERROR,
  USER_NOT_FOUND,
} from './error-messages/error-messages.js';
import EmailRepository from '../../repositories/email-repository.js';
import UserRepository from '../../repositories/user-repository.js';
import ActivationError from '../errors/activation-error.js';
import NotFoundError from '../errors/not-found-error.js';
import emailValidator from './validators/email-validator.js';

const { RESET_PASSWORD_CODE_EXPIRATION } = process.env;

/**
 * Verifies the passed email belong to a user who is active.
 * @param {String} email email
 * @throws {NotFoundError} if the user does not exist.
 * @throws {ActivationError} if the user is not currently active.
 * @returns {User} user found.
 */
const checkUser = async (email) => {
  const user = await UserRepository.findByEmail(email);

  if (!user) {
    throw new NotFoundError(USER_NOT_FOUND);
  }

  if (!user.active) {
    throw new ActivationError(
      INACTIVE_USER_ERROR,
      `email:${email}`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  return user;
};

export default async (data) => {
  const { email } = data;
  await emailValidator(email);
  const user = await checkUser(email);
  const resetPasswordCode = uuidv4();
  const expiration = new Date(
    Date.now() + Number(RESET_PASSWORD_CODE_EXPIRATION),
  );
  await UserRepository.generateResetPasswordCode(
    user._id,
    resetPasswordCode,
    expiration,
  );
  await EmailRepository.sendResetPassword(email, resetPasswordCode);
};
