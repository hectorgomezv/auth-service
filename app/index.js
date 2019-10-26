require('dotenv').config();

const {
  webServer,
  database,
  logger,
} = require('./infrastructure');

const { RbacEntity } = require('./domain/entities/rbac');

(async () => {
  try {
    await database.connect();
    await RbacEntity.init();
    await webServer.init();
  } catch (err) {
    logger.error(err);
  }
})();
