const faker = require('faker');
const { OK } = require('http-status-codes');
const { MongoClient } = require('mongodb');
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
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();

  return connect(mongoUri);
}

async function setupData(db) {
  const col = db.collection('users');
  await col.insertOne(USER);
  const count = await col.countDocuments({});
  expect(count).toBe(1);
}

describe('[integration-tests] [login]', () => {
  beforeAll(async () => {
    await mountRouters(app);
    const db = await setupDatabase();

    return setupData(db);
  });

  afterAll(async () => {
    if (con) con.close();
    if (mongoServer) await mongoServer.stop();
  });

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
    expect(JSON.parse(res.body)).toMatchObject({ data: USER });
  });
});
