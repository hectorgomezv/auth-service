const faker = require('faker');
const { NOT_FOUND, UNAUTHORIZED } = require('http-status-codes');

const {
  EmailRepository,
  UserRepository,
} = require('../../../../../app/domain/repositories');

const { forgotPassword } = require('../../../../../app/domain/use-cases/account');
const { USER_NOT_FOUND, INACTIVE_USER_ERROR } = require('../../../../../app/domain/use-cases/account/error-messages');

const EMAIL = faker.internet.email();
const ID = faker.random.alphaNumeric();

const USER = {
  _id: ID,
  email: EMAIL,
  fullName: `${faker.name.firstName()} ${faker.name.lastName}`,
  avatarUrl: faker.internet.url(),
  active: true,
  role: faker.random.word(),
};

describe('[use-cases-tests] [account] [forgot-password]', () => {
  beforeEach(() => {
    UserRepository.findByEmail = jest.fn().mockResolvedValue(USER);
    UserRepository.generateResetPasswordCode = jest.fn().mockResolvedValue(USER);
  });

  it('should fail if the repository can find the user email', async () => {
    UserRepository.findByEmail = jest.fn(() => null);
    await expect(forgotPassword(EMAIL)).rejects.toMatchObject({
      code: NOT_FOUND,
      name: 'NotFoundError',
      message: USER_NOT_FOUND,
    });
  });

  it('should fail if the found user is not active', async () => {
    UserRepository.findByEmail.mockResolvedValue({ ...USER, active: false });
    await expect(forgotPassword(EMAIL)).rejects.toMatchObject({
      code: UNAUTHORIZED,
      name: 'ActivationError',
      message: INACTIVE_USER_ERROR,
      pointer: `email:${EMAIL}`,
    });
  });

  it('should call repository to store the user with resetPasswordCode', async () => {
    await forgotPassword(EMAIL);
    expect(UserRepository.generateResetPasswordCode).toHaveBeenCalledTimes(1);
    expect(UserRepository.generateResetPasswordCode)
      .toHaveBeenCalledWith(ID, expect.any(String), expect.any(Number));
  });
});