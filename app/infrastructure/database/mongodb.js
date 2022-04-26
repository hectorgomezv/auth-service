const { MongoClient } = require('mongodb');
const { logger } = require('../logger');

const {
  MONGO_CONNECTION_STRING,
  MONGO_DATABASE_NAME,
} = process.env;

let connection;
let client;

const buildMongoClient = (mongoUri = MONGO_CONNECTION_STRING) => new MongoClient(mongoUri);

const connect = async (mongoUri) => {
  try {
    if (!connection) {
      client = buildMongoClient(mongoUri);
      await client.connect();
      connection = await client.db(MONGO_DATABASE_NAME);
      logger.info(`Connected to database ${MONGO_DATABASE_NAME} on MongoDB`);
    }

    return connection;
  } catch (err) {
    logger.error(err);

    return process.exit(1);
  }
};

const disconnect = async () => {
  await client.close();
};

const db = () => connection;

module.exports = {
  db,
  connect,
  disconnect,
};
