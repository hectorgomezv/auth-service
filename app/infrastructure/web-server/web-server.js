const fastify = require('fastify');
const middie = require('middie');

const { logger } = require('../logger');

const {
  accountRouter,
  userRouter,
} = require('../../interfaces/routers');

const { PORT } = process.env;

const app = fastify({ logger });
const BASE_URL = '/api/v1/auth';

const mountRouters = async (appInstance) => {
  await app.register(middie);
  appInstance.register(accountRouter, { prefix: `${BASE_URL}/accounts` });
  appInstance.register(userRouter, { prefix: `${BASE_URL}/users` });
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
