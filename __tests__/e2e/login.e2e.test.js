import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import OK from 'http-status-codes';
import MongoMemoryServer from 'mongodb-memory-server';
import { connect } from '../../app/infrastructure/database/mongodb.js';
import webServer from '../../app/infrastructure/web-server/web-server.js';

jest.useFakeTimers();

const URL = '/api/v1/auth/accounts/login';

const USER = {
  email: faker.internet.email(),
  username: faker.internet.userName(),
  password: faker.internet.password(),
  fullName: faker.internet.userName(),
  role: 'user',
  active: true,
  sessions: [],
};

let mongoServer;
let con;

async function setupDatabase() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = await mongoServer.getUri();

  return connect(mongoUri);
}

async function setupData(db) {
  const col = db.collection('users');
  await col.insertOne({
    ...USER,
    password: await bcrypt.hash(USER.password, 10),
  });
  const count = await col.countDocuments({});
  expect(count).toBe(1);
}

describe('[integration-tests] [login]', () => {
  beforeAll(async () => {
    await webServer.mountRouters(webServer.app);
    const db = await setupDatabase();

    return setupData(db);
  });

  afterAll(async () => {
    if (con) con.close();
    if (mongoServer) await mongoServer.stop();
  });

  it('[200] login successful', async () => {
    const res = await webServer.app.inject({
      method: 'POST',
      url: URL,
      payload: {
        data: {
          email: USER.email,
          password: USER.password,
        },
      },
    });

    expect(res.statusCode).toBe(OK);
    expect(JSON.parse(res.body)).toMatchObject({
      data: {
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
        refreshTokenExpiresIn: expect.any(Number),
        user: {
          email: USER.email,
          fullName: USER.fullName,
          role: USER.role,
        },
      },
    });
  });
});
