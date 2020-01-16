const Agenda = require('agenda');

const { clearExpiredSessions } = require('../../domain/use-cases/user');

const {
  MONGO_CONNECTION_STRING,
  MONGO_DATABASE_NAME,
} = process.env;

const agenda = new Agenda({
  db: {
    address: `${MONGO_CONNECTION_STRING}${MONGO_DATABASE_NAME}`,
    collection: 'batches',
  },
});

agenda.define('delete old sessions', async () => clearExpiredSessions());

const init = async () => {
  await agenda.start();
  await agenda.every('10 seconds', 'delete old sessions');
};

module.exports = {
  init,
};
