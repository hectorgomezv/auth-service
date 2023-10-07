import { MongoClient } from 'mongodb';
import logger from '../logger/pino.js';

const { MONGO_CONNECTION_STRING, MONGO_DATABASE_NAME } = process.env;

let connection;
let client;

const buildMongoClient = (mongoUri = MONGO_CONNECTION_STRING) =>
  new MongoClient(mongoUri);

export const connect = async (mongoUri) => {
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

export const disconnect = async () => {
  await client.close();
};

export const db = () => connection;
