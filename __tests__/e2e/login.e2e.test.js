const faker = require('faker');
const bcrypt = require('bcrypt');
const { OK } = require('http-status-codes');
const { MongoMemoryServer } = require('mongodb-memory-server');

const {
  webServer: {
    app,
    mountRouters,
  },
  database: {
    connect,
  },
} = require('../../app/infrastructure');

const URL = '/api/auth/accounts/login';

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
  console.log('HELLO');
  mongoServer = new MongoMemoryServer();
  console.log('WORLD');
  const mongoUri = await mongoServer.getConnectionString();
  console.log(mongoUri);

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
    await mountRouters(app);
    const db = await setupDatabase();

    // return setupData(db);
  });

  // afterAll(async () => {
  //   if (con) con.close();
  //   if (mongoServer) await mongoServer.stop();
  // });

  it('[200] login successful', async () => {
    const res = await app.inject({
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
