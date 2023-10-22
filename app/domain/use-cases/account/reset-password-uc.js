import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import UserRepository from '../../repositories/user-repository.js';
import ActivationError from '../errors/activation-error.js';
import ForbiddenActionError from '../errors/forbidden-action-error.js';
import NotFoundError from '../errors/not-found-error.js';
import {
  EXPIRED_RESET_PASSWORD_CODE,
  INACTIVE_USER_ERROR,
  RESET_PASSWORD_CODE_NOT_FOUND,
} from './error-messages/error-messages.js';
import resetPasswordValidator from './validators/reset-password-validator.js';

export default async (data) => {
  await resetPasswordValidator(data);

  const { password, resetPasswordCode } = data;

  const user = await UserRepository.findByResetPasswordCode(resetPasswordCode);

  if (!user) {
    throw new NotFoundError(RESET_PASSWORD_CODE_NOT_FOUND);
  }

  if (!user.active) {
    throw new ActivationError(
      INACTIVE_USER_ERROR,
      `email:${user.email}`,
      StatusCodes.UNAUTHORIZED,
    );
  }

  const expiration = user.resetPasswordExpiration.getTime();

  if (expiration < Date.now()) {
    throw new ForbiddenActionError(EXPIRED_RESET_PASSWORD_CODE);
  }

  const securePassword = await bcrypt.hash(password, 10);
  const updated = await UserRepository.applyResetPassword(
    user._id,
    securePassword,
  );

  return updated;
};
