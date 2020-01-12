const faker = require('faker');
const { FORBIDDEN, NOT_FOUND, UNAUTHORIZED } = require('http-status-codes');

const { UserRepository } = require('../../../../../app/domain/repositories');
const { resetPassword } = require('../../../../../app/domain/use-cases/account');

const {
  EXPIRED_RESET_PASSWORD_CODE,
  INACTIVE_USER_ERROR,
  RESET_PASSWORD_CODE_NOT_FOUND,
} = require('../../../../../app/domain/use-cases/account/error-messages');

const { RESET_PASSWORD_CODE_EXPIRATION } = process.env;

const RESET_PASSWORD_CODE = faker.random.uuid();
const PASSWORD = faker.random.alphaNumeric();

const DATA = {
  resetPasswordCode: RESET_PASSWORD_CODE,
  password: PASSWORD,
  repeatedPassword: PASSWORD,
};

const USER = {
  _id: faker.random.alphaNumeric(),
  email: faker.internet.email(),
  fullName: `${faker.name.firstName()} ${faker.name.lastName}`,
  avatarUrl: faker.internet.url(),
  active: true,
  role: faker.random.word(),
  resetPasswordCode: faker.random.uuid(),
  resetPasswordCodeExpiration: new Date(Date.now() + Number(RESET_PASSWORD_CODE_EXPIRATION)),
};

describe('[use-cases-tests] [account] [reset-password]', () => {
  beforeEach(() => {
    UserRepository.findByResetPasswordCode = jest.fn().mockResolvedValue(USER);
    UserRepository.applyResetPassword = jest.fn().mockResolvedValue({
      ...USER,
      password: PASSWORD,
      resetPasswordCode: null,
      resetPasswordCodeExpiration: Date.now(),
    });
  });

  it('should fail if the password is not repeated', async () => {
    await expect(resetPassword({
      ...DATA,
      repeatedPassword: faker.random.alphaNumeric(),
    })).rejects.toThrow();
  });

  it('should fail if the repository cannot find the reset password code', async () => {
    UserRepository.findByResetPasswordCode = jest.fn(() => null);
    await expect(resetPassword(DATA)).rejects.toMatchObject({
      code: NOT_FOUND,
      name: 'NotFoundError',
      message: RESET_PASSWORD_CODE_NOT_FOUND,
    });
  });

  it('should fail if the found user is not active', async () => {
    UserRepository.findByResetPasswordCode.mockResolvedValue({ ...USER, active: false });
    await expect(resetPassword(DATA)).rejects.toMatchObject({
      code: UNAUTHORIZED,
      name: 'ActivationError',
      message: INACTIVE_USER_ERROR,
      pointer: `email:${USER.email}`,
    });
  });


  it('should fail if the reset password code is expired', async () => {
    UserRepository.findByResetPasswordCode.mockResolvedValue({
      ...USER,
      resetPasswordCodeExpiration: new Date(Date.now() - 1),
    });

    await expect(resetPassword(DATA)).rejects.toMatchObject({
      code: FORBIDDEN,
      name: 'ForbiddenActionError',
      message: EXPIRED_RESET_PASSWORD_CODE,
    });
  });

  it('should call repository to apply the reset', async () => {
    await resetPassword(DATA);
    expect(UserRepository.applyResetPassword).toHaveBeenCalledTimes(1);
    expect(UserRepository.applyResetPassword)
      .toHaveBeenCalledWith(USER._id, expect.any(String));
  });
});