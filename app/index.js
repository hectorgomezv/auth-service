require('dotenv').config();

const {
  webServer,
  database,
  logger,
} = require('./infrastructure');

const { batches } = require('./interfaces/batches');

const { RbacEntity } = require('./domain/entities/rbac');

(async () => {
  try {
    await database.connect();
    await RbacEntity.init();
    await batches.init();

    return webServer.init();
  } catch (err) {
    return logger.error(err);
  }
})();
