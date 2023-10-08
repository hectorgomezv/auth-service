import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import {
  BAD_LOGIN_ERROR,
  INACTIVE_USER_ERROR,
} from '../../../../../app/domain/use-cases/account/error-messages/error-messages';
import UserRepository from '../../../../../app/domain/repositories/user-repository';
import login from '../../../../../app/domain/use-cases/account/login-uc';

const EMAIL = faker.internet.email();

const CREDENTIALS = {
  email: EMAIL,
  password: faker.internet.password(),
};

const USER = {
  email: EMAIL,
  fullName: `${faker.person.firstName()} ${faker.person.lastName}`,
  avatarUrl: faker.internet.url(),
  active: true,
  role: faker.lorem.word(),
};

const USER_WITH_SESSIONS = {
  ...USER,
  sessions: [
    {
      accessToken: faker.string.uuid(),
      refreshToken: faker.string.uuid(),
      createdAt: faker.date.past(),
    },
  ],
};

describe('[use-cases-tests] [account] [login]', () => {
  beforeEach(() => {
    UserRepository.findByEmail = jest.fn().mockResolvedValue(USER);
    UserRepository.addSession = jest.fn().mockResolvedValue(USER_WITH_SESSIONS);
  });

  it('should fail if the repository can find the user email', async () => {
    UserRepository.findByEmail = jest.fn(() => null);
    await expect(login(CREDENTIALS)).rejects.toMatchObject({
      name: 'AuthenticationError',
      message: BAD_LOGIN_ERROR,
      code: StatusCodes.UNAUTHORIZED,
    });
  });

  it('should fail if the found user is not active', async () => {
    const hashedPass = await bcrypt.hash(CREDENTIALS.password, 10);

    UserRepository.findByEmail = jest.fn(() => ({
      ...USER,
      password: hashedPass,
      active: false,
    }));

    await expect(login(CREDENTIALS)).rejects.toMatchObject({
      name: 'AuthenticationError',
      message: INACTIVE_USER_ERROR,
      pointer: `email:${USER.email}`,
      code: StatusCodes.UNAUTHORIZED,
    });
  });

  it('should fail if the password is incorrect', async () => {
    UserRepository.findByEmail = jest.fn(() => ({
      ...USER,
      password: 'invalidHashedPassword',
      active: true,
    }));

    await expect(login(CREDENTIALS)).rejects.toMatchObject({
      name: 'AuthenticationError',
      message: BAD_LOGIN_ERROR,
      code: StatusCodes.UNAUTHORIZED,
    });
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
        refreshTokenExpiresIn: expect.any(Number),
        user: USER,
      },
    });
  });
});
