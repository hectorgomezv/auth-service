import { jest } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import UserRepository from '../../../../../app/domain/repositories/user-repository';
import resetPassword from '../../../../../app/domain/use-cases/account/reset-password-uc';
import {
  EXPIRED_RESET_PASSWORD_CODE,
  INACTIVE_USER_ERROR,
  RESET_PASSWORD_CODE_NOT_FOUND,
} from '../../../../../app/domain/use-cases/account/error-messages/error-messages';

const { RESET_PASSWORD_CODE_EXPIRATION } = process.env;

const RESET_PASSWORD_CODE = faker.string.uuid();
const PASSWORD = faker.string.alphanumeric();

const DATA = {
  resetPasswordCode: RESET_PASSWORD_CODE,
  password: PASSWORD,
  repeatedPassword: PASSWORD,
};

const USER = {
  _id: faker.string.alphanumeric(),
  email: faker.internet.email(),
  fullName: `${faker.person.firstName()} ${faker.person.lastName}`,
  avatarUrl: faker.internet.url(),
  active: true,
  role: faker.lorem.word(),
  resetPasswordCode: faker.string.uuid(),
  resetPasswordExpiration: new Date(
    Date.now() + Number(RESET_PASSWORD_CODE_EXPIRATION),
  ),
};

describe('[use-cases-tests] [account] [reset-password]', () => {
  beforeEach(() => {
    UserRepository.findByResetPasswordCode = jest.fn().mockResolvedValue(USER);
    UserRepository.applyResetPassword = jest.fn().mockResolvedValue({
      ...USER,
      password: PASSWORD,
      resetPasswordCode: null,
      resetPasswordExpiration: Date.now(),
    });
  });

  it('should fail if the password is not repeated', async () => {
    await expect(
      resetPassword({
        ...DATA,
        repeatedPassword: faker.string.alphanumeric(),
      }),
    ).rejects.toThrow();
  });

  it('should fail if the repository cannot find the reset password code', async () => {
    UserRepository.findByResetPasswordCode = jest.fn(() => null);
    await expect(resetPassword(DATA)).rejects.toMatchObject({
      code: StatusCodes.NOT_FOUND,
      name: 'NotFoundError',
      message: RESET_PASSWORD_CODE_NOT_FOUND,
    });
  });

  it('should fail if the found user is not active', async () => {
    UserRepository.findByResetPasswordCode.mockResolvedValue({
      ...USER,
      active: false,
    });
    await expect(resetPassword(DATA)).rejects.toMatchObject({
      code: StatusCodes.UNAUTHORIZED,
      name: 'ActivationError',
      message: INACTIVE_USER_ERROR,
      pointer: `email:${USER.email}`,
    });
  });

  it('should fail if the reset password code is expired', async () => {
    UserRepository.findByResetPasswordCode.mockResolvedValue({
      ...USER,
      resetPasswordExpiration: new Date(Date.now() - 1),
    });

    await expect(resetPassword(DATA)).rejects.toMatchObject({
      code: StatusCodes.FORBIDDEN,
      name: 'ForbiddenActionError',
      message: EXPIRED_RESET_PASSWORD_CODE,
    });
  });

  it('should call repository to apply the reset', async () => {
    await resetPassword(DATA);
    expect(UserRepository.applyResetPassword).toHaveBeenCalledTimes(1);
    expect(UserRepository.applyResetPassword).toHaveBeenCalledWith(
      USER._id,
      expect.any(String),
    );
  });
});
