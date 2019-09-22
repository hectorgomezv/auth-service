const { webServer } = require('./web-server');
const { database } = require('./database');
const { logger } = require('./logger');

module.exports = {
  webServer,
  database,
  logger,
};
