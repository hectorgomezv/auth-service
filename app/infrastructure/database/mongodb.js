const { MongoClient } = require('mongodb');

const {
  MONGO_CONNECTION_STRING,
  MONGO_DATABASE_NAME,
} = process.env;

const client = new MongoClient(MONGO_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  reconnectTries: Number.MAX_VALUE,
});

const connect = async () => {
  await client.connect();
  return client.db(MONGO_DATABASE_NAME);
};

const disconnect = async () => {
  await client.close();
};

module.exports = {
  connect,
  disconnect,
};
