const faker = require('faker');
const { NOT_FOUND, UNAUTHORIZED, BAD_REQUEST } = require('http-status-codes');

const { UserRepository } = require('../../../../../app/domain/repositories');
const { resetPassword } = require('../../../../../app/domain/use-cases/account');

const {
  RESET_PASSWORD_CODE_NOT_FOUND,
  INACTIVE_USER_ERROR,
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
  beforeAll(() => {
    UserRepository.findByResetPasswordCode = jest.fn().mockResolvedValue(USER);
    UserRepository.applyResetPassword = jest.fn().mockResolvedValue({
      ...USER,
      password: PASSWORD,
      resetPasswordCode: null,
      resetPasswordCodeExpiration: Date.now(),
    });
  });

  it('should fail if the password is not repeated', async () => {
    await expect(resetPassword(DATA)).rejects.toMatchObject({
      code: BAD_REQUEST,
      name: 'ValidationError',
    });
  });

  it('should fail if the repository can find the reset password code', async () => {
    UserRepository.findByResetPasswordCode = jest.fn(() => null);
    await expect(resetPassword(DATA)).rejects.toMatchObject({
      code: NOT_FOUND,
      name: 'NotFoundError',
      message: RESET_PASSWORD_CODE_NOT_FOUND,
    });
  });

  it('should fail if the found user is not active', async () => {
    UserRepository.findByEmail.mockResolvedValue({ ...USER, active: false });
    await expect(resetPassword(DATA)).rejects.toMatchObject({
      code: UNAUTHORIZED,
      name: 'ActivationError',
      message: INACTIVE_USER_ERROR,
      pointer: `email:${EMAIL}`,
    });
  });

  it('should call repository to store the user with resetPasswordCode', async () => {
    await resetPassword(DATA);
    expect(UserRepository.applyResetPassword).toHaveBeenCalledTimes(1);
    expect(UserRepository.applyResetPassword)
      .toHaveBeenCalledWith(USER._id, expect.any(String));
  });
});