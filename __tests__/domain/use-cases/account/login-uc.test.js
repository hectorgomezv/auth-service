const bcrypt = require('bcrypt');
const { UNAUTHORIZED } = require('http-status-codes');
const { UserRepository } = require('../../../../app/domain/repositories');
const { login } = require('../../../../app/domain/use-cases/account');

const CREDENTIALS = {
  email: 'user@test.com',
  password: 'testPassword',
};

const USER = {
  email: 'user@test.com',
  fullName: 'Test user',
  avatarUrl: 'testUrl',
  active: true,
  roles: ['reader'],
};

describe('[use-cases-tests] [login]', () => {
  beforeEach(() => {
    UserRepository.findByEmail = jest.fn(() => USER);
    UserRepository.addSession = jest.fn(() => ({
      ...USER,
      sessions: [{
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        createdAt: new Date(),
      }],
    }));
  });

  it('should fail if the repository can find the user email', async (done) => {
    try {
      UserRepository.findByEmail = jest.fn(() => null);
      await login(CREDENTIALS);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        name: 'AuthenticationError',
        message: 'Bad username or password',
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
        message: 'Inactive user',
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
        message: 'Bad username or password',
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
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      expiresIn: expect.any(Number),
      user: expect.objectContaining({
        avatarUrl: expect.any(String),
        email: expect.any(String),
        fullName: expect.any(String),
        roles: expect.any(Array),
      }),
    });
  });
});
