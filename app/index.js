require('dotenv').config();

const {
  webServer,
  database,
  logger,
} = require('./infrastructure');


(async () => {
  try {
    webServer.init();
    database.connect();
  } catch (err) {
    logger.error(err);
  }
})();
