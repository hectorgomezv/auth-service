import 'dotenv/config';

import webServer from './infrastructure/web-server/web-server.js';
import { connect } from './infrastructure/database/mongodb.js';
import logger from './infrastructure/logger/pino.js';
import batches from './interfaces/batches/executor.js';
import RbacEntity from './domain/entities/rbac/rbac-entity.js';

(async () => {
  try {
    await connect();
    await RbacEntity.init();
    await batches.init();

    return webServer.init();
  } catch (err) {
    return logger.error(err);
  }
})();
