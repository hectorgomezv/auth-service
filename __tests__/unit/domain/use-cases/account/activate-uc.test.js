const faker = require('faker');

const {
  NOT_FOUND,
  NOT_ACCEPTABLE,
} = require('http-status-codes');

const {
  ACTIVATION_CODE_NOT_FOUND,
  ALREADY_ACTIVE_ERROR,
} = require('../../../../../app/domain/use-cases/account/error-messages');

const { UserRepository } = require('../../../../../app/domain/repositories');
const { activate } = require('../../../../../app/domain/use-cases/account');

const ACTIVATION_CODE = faker.random.uuid();
const PASSWORD = faker.random.alphaNumeric();

const USER = {
  email: faker.internet.email(),
  fullName: `${faker.name.firstName()} ${faker.name.lastName}`,
  avatarUrl: faker.internet.url(),
  active: false,
  role: faker.random.word(),
};

describe('[use-cases-tests] [account] [activate]', () => {
  beforeEach(() => {
    UserRepository.findByActivationCode = jest.fn().mockResolvedValue(USER);
    UserRepository.activate = jest.fn().mockResolvedValue({
      ...USER,
      active: true,
    });
  });

  it('should fail if the repository can find the activation code', async (done) => {
    try {
      UserRepository.findByActivationCode = jest.fn(() => null);
      await activate(ACTIVATION_CODE, PASSWORD, PASSWORD);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        name: 'NotFoundError',
        message: ACTIVATION_CODE_NOT_FOUND,
        code: NOT_FOUND,
      });
      done();
    }
  });

  it('should fail if the found user is already active', async (done) => {
    try {
      UserRepository.findByActivationCode.mockResolvedValue({
        ...USER,
        active: true,
      });

      await activate(ACTIVATION_CODE, PASSWORD, PASSWORD);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        name: 'ActivationError',
        message: ALREADY_ACTIVE_ERROR,
        code: NOT_ACCEPTABLE,
      });
      done();
    }
  });

  it('should activate the account', async () => {
    const result = await activate(ACTIVATION_CODE, PASSWORD, PASSWORD);
    expect(UserRepository.activate).toHaveBeenCalledTimes(1);
    expect(UserRepository.activate).toHaveBeenCalledWith(USER._id, expect.any(String));
    expect(result).toMatchObject({
      data: {
        ...USER,
        active: true,
      },
    });
  });
});
