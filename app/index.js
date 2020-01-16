require('dotenv').config();

const {
  webServer,
  database,
  logger,
} = require('./infrastructure');

const { clearExpiredSessionsBatch } = require('./interfaces/batches');

const { RbacEntity } = require('./domain/entities/rbac');

(async () => {
  try {
    await database.connect();
    await RbacEntity.init();
    await clearExpiredSessionsBatch.init();

    return webServer.init();
  } catch (err) {
    return logger.error(err);
  }
})();
