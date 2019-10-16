const bcrypt = require('bcrypt');
const faker = require('faker');
const { UNAUTHORIZED } = require('http-status-codes');

const {
  BAD_LOGIN_ERROR,
  INACTIVE_USER_ERROR,
} = require('../../../../app/domain/use-cases/account/error-messages');
const { UserRepository } = require('../../../../app/domain/repositories');
const { login } = require('../../../../app/domain/use-cases/account');

const EMAIL = faker.internet.email();

const CREDENTIALS = {
  email: EMAIL,
  password: faker.internet.password(),
};

const USER = {
  email: EMAIL,
  fullName: `${faker.name.firstName()} ${faker.name.lastName}`,
  avatarUrl: faker.internet.url(),
  active: true,
  role: faker.random.word(),
};

const USER_WITH_SESSIONS = {
  ...USER,
  sessions: [{
    accessToken: faker.random.uuid(),
    refreshToken: faker.random.uuid(),
    createdAt: faker.date.past(),
  }],
};

describe('[use-cases-tests] [account] [login]', () => {
  beforeEach(() => {
    UserRepository.findByEmail = jest.fn().mockResolvedValue(USER);
    UserRepository.addSession = jest.fn().mockResolvedValue(USER_WITH_SESSIONS);
  });

  it('should fail if the repository can find the user email', async (done) => {
    try {
      UserRepository.findByEmail = jest.fn(() => null);
      await login(CREDENTIALS);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        name: 'AuthenticationError',
        message: BAD_LOGIN_ERROR,
        code: UNAUTHORIZED,
      });
      done();
    }
  });

  it('should fail if the found user is not active', async (done) => {
    try {
      const hashedPass = await bcrypt.hash(CREDENTIALS.password, 10);
      UserRepository.findByEmail = jest.fn(() => ({
        ...USER,
        password: hashedPass,
        active: false,
      }));
      await login(CREDENTIALS);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        name: 'AuthenticationError',
        message: INACTIVE_USER_ERROR,
        pointer: `email:${USER.email}`,
        code: UNAUTHORIZED,
      });
      done();
    }
  });

  it('should fail if the password is incorrect', async (done) => {
    try {
      UserRepository.findByEmail = jest.fn(() => ({
        ...USER,
        password: 'invalidHashedPassword',
        active: true,
      }));
      await login(CREDENTIALS);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        name: 'AuthenticationError',
        message: BAD_LOGIN_ERROR,
        code: UNAUTHORIZED,
      });
      done();
    }
  });

  it('should persist session info, and return accessToken, refreshToken, expiresIn and user data', async () => {
    const hashedPass = await bcrypt.hash(CREDENTIALS.password, 10);
    UserRepository.findByEmail = jest.fn(() => ({
      ...USER,
      _id: 'fakeId',
      password: hashedPass,
      active: true,
    }));
    const result = await login(CREDENTIALS);
    expect(UserRepository.addSession).toHaveBeenCalledTimes(1);
    expect(UserRepository.addSession).toHaveBeenCalledWith('fakeId', {
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      createdAt: expect.any(Date),
    });
    expect(result).toMatchObject({
      data: {
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
        user: USER,
      },
    });
  });
});
