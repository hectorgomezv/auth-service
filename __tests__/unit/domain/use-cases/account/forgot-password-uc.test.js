import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import { StatusCodes } from 'http-status-codes';
import EmailRepository from '../../../../../app/domain/repositories/email-repository';
import UserRepository from '../../../../../app/domain/repositories/user-repository';
import {
  INACTIVE_USER_ERROR,
  USER_NOT_FOUND,
} from '../../../../../app/domain/use-cases/account/error-messages/error-messages';
import forgotPassword from '../../../../../app/domain/use-cases/account/forgot-password-uc';

const EMAIL = faker.internet.email();
const ID = faker.string.alphanumeric();

const DATA = {
  email: EMAIL,
};

const USER = {
  _id: ID,
  email: EMAIL,
  fullName: `${faker.person.firstName()} ${faker.person.lastName}`,
  avatarUrl: faker.internet.url(),
  active: true,
  role: faker.lorem.word(),
  resetPasswordExpiration: new Date(Date.now() + 60000),
};

describe('[use-cases-tests] [account] [forgot-password]', () => {
  beforeEach(() => {
    UserRepository.findByEmail = jest.fn().mockResolvedValue(USER);
    UserRepository.generateResetPasswordCode = jest
      .fn()
      .mockResolvedValue(USER);
    EmailRepository.sendResetPassword = jest.fn();
  });

  it('should fail if the repository can find the user email', async () => {
    UserRepository.findByEmail = jest.fn(() => null);
    await expect(forgotPassword(DATA)).rejects.toMatchObject({
      code: StatusCodes.NOT_FOUND,
      name: 'NotFoundError',
      message: USER_NOT_FOUND,
    });
  });

  it('should fail if the found user is not active', async () => {
    UserRepository.findByEmail.mockResolvedValue({ ...USER, active: false });
    await expect(forgotPassword(DATA)).rejects.toMatchObject({
      code: StatusCodes.UNAUTHORIZED,
      name: 'ActivationError',
      message: INACTIVE_USER_ERROR,
      pointer: `email:${EMAIL}`,
    });
  });

  it('should call repository to store the user with resetPasswordCode', async () => {
    await forgotPassword(DATA);
    expect(UserRepository.generateResetPasswordCode).toHaveBeenCalledTimes(1);
    expect(UserRepository.generateResetPasswordCode).toHaveBeenCalledWith(
      ID,
      expect.any(String),
      expect.any(Date),
    );
  });

  it('should call EmailRepository to send a resetPassword email', async () => {
    await forgotPassword(DATA);
    expect(EmailRepository.sendResetPassword).toHaveBeenCalledTimes(1);
    expect(EmailRepository.sendResetPassword).toHaveBeenCalledWith(
      EMAIL,
      expect.any(String),
    );
  });
});
