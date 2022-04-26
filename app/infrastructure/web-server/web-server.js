const fastify = require('fastify');
const middie = require('middie');

const {
  logger,
  config: loggerConfig,
} = require('../logger');

const {
  accountRouter,
  userRouter,
} = require('../../interfaces/routers');

const { PORT } = process.env;

const app = fastify({ logger: loggerConfig });
const baseUrl = '/api/auth';

const mountRouters = async (appInstance) => {
  await app.register(middie);
  appInstance.register(accountRouter, { prefix: `${baseUrl}/accounts` });
  appInstance.register(userRouter, { prefix: `${baseUrl}/users` });
};

const init = async (port = Number(PORT)) => {
  try {
    await mountRouters(app);
    logger.info(`Listening on ${port}`);
    return app.listen(port, '0.0.0.0');
  } catch (err) {
    logger.error(err);
    return process.exit(1);
  }
};

module.exports = {
  app,
  init,
  mountRouters,
};
