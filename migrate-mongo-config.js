import 'dotenv/config';

const { MONGO_CONNECTION_STRING, MONGO_DATABASE_NAME } = process.env;

export default {
  mongodb: {
    url: MONGO_CONNECTION_STRING,
    databaseName: MONGO_DATABASE_NAME,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
};
