const fastify = require('fastify');

const {
  logger,
  config: loggerConfig,
} = require('../logger');
const { accountRouter } = require('../../interfaces/routers');

const { PORT } = process.env;

const app = fastify({ logger: loggerConfig });

const mountRouters = () => {
  app.register(accountRouter, { prefix: '/api/account' });
};

const init = async (port = Number(PORT)) => {
  try {
    mountRouters();
    await app.listen(port);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

module.exports = {
  init,
};
