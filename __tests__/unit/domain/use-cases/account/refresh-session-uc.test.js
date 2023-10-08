import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import UserRepository from '../../../../../app/domain/repositories/user-repository';
import {
  EXPIRED_TOKEN,
  INACTIVE_USER_ERROR,
  SESSION_NOT_FOUND,
  USER_NOT_FOUND,
} from '../../../../../app/domain/use-cases/account/error-messages/error-messages';
import refreshSession from '../../../../../app/domain/use-cases/account/refresh-session-uc';

const { REFRESH_TOKEN_EXPIRATION } = process.env;

const ACCESS_TOKEN = faker.string.alphanumeric();
const REFRESH_TOKEN = faker.string.alphanumeric();

const DATA = {
  accessToken: ACCESS_TOKEN,
  refreshToken: REFRESH_TOKEN,
};

const USER = {
  _id: faker.string.alphanumeric(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.string.alphanumeric(),
  fullName: `${faker.person.firstName()} ${faker.person.lastName()}`,
  active: true,
  role: 'role',
  sessions: [
    {
      accessToken: ACCESS_TOKEN,
      refreshToken: REFRESH_TOKEN,
      createdAt: new Date(),
    },
    {
      accessToken: 'anotherAccessToken',
      refreshToken: 'anotherRefreshToken',
      createdAt: new Date(),
    },
  ],
};

describe('[use-cases-tests] [account] [refresh-session]', () => {
  beforeEach(() => {
    jwt.verify = jest.fn(() => ({ id: USER._id }));
    bcrypt.compare = jest.fn(() => true);
    UserRepository.addSession = jest.fn(() => USER);

    UserRepository.findByIdAndFilterSessionByAccessToken = jest
      .fn()
      .mockResolvedValue({
        ...USER,
        sessions: [USER.sessions[0]],
      });
  });

  it('should fail if the user cannot be found', async () => {
    UserRepository.findByIdAndFilterSessionByAccessToken = jest.fn(() => null);
    await expect(refreshSession(DATA)).rejects.toMatchObject({
      name: 'NotFoundError',
      message: USER_NOT_FOUND,
      code: StatusCodes.UNAUTHORIZED,
    });
  });

  it('should fail if the user is not active', async () => {
    UserRepository.findByIdAndFilterSessionByAccessToken = jest.fn(() => ({
      ...USER,
      active: false,
    }));

    await expect(refreshSession(DATA)).rejects.toMatchObject({
      name: 'ActivationError',
      message: INACTIVE_USER_ERROR,
      code: StatusCodes.UNAUTHORIZED,
    });
  });

  it('should fail if the session cannot be found', async () => {
    UserRepository.findByIdAndFilterSessionByAccessToken = jest.fn(() => ({
      ...USER,
      sessions: [],
    }));

    await expect(refreshSession(DATA)).rejects.toMatchObject({
      name: 'NotFoundError',
      message: SESSION_NOT_FOUND,
      pointer: `user:${USER._id}`,
      code: StatusCodes.UNAUTHORIZED,
    });
  });

  it('should fail if the session and the refresh token do not match', async () => {
    bcrypt.compare = jest.fn(() => false);

    await expect(refreshSession(DATA)).rejects.toMatchObject({
      name: 'NotFoundError',
      message: SESSION_NOT_FOUND,
      pointer: `user:${USER._id}`,
      code: StatusCodes.UNAUTHORIZED,
    });
  });

  it('should fail if the token is expired', async () => {
    UserRepository.findByIdAndFilterSessionByAccessToken = jest.fn(() => ({
      ...USER,
      sessions: USER.sessions.map((session) => ({
        ...session,
        createdAt: new Date(Date.now() - Number(REFRESH_TOKEN_EXPIRATION) - 1),
      })),
    }));

    await expect(refreshSession(DATA)).rejects.toMatchObject({
      name: 'ForbiddenActionError',
      message: EXPIRED_TOKEN,
      pointer: `user:${USER._id}`,
      code: StatusCodes.UNAUTHORIZED,
    });
  });

  it('should call the repository to update the user and return new accessToken', async () => {
    const session = await refreshSession(DATA);
    expect(UserRepository.addSession).toHaveBeenCalledTimes(1);

    expect(UserRepository.addSession).toHaveBeenCalledWith(
      USER._id,
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    );

    expect(session).toMatchObject(
      expect.objectContaining({
        data: {
          accessToken: expect.any(String),
          expiresIn: expect.any(Number),
        },
      }),
    );

    expect(session).not.toHaveProperty('refreshToken');
  });
});
