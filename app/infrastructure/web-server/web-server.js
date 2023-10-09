import fastify from 'fastify';
import cors from '@fastify/cors';
import middie from '@fastify/middie';

import logger from '../logger/pino.js';
import accountRouter from '../../interfaces/routers/account-router.js';
import userRouter from '../../interfaces/routers/user-router.js';

const { CORS_BASE_URL, PORT } = process.env;

const app = fastify({ logger });
const BASE_URL = '/api/v1/auth';

const getAllowedOrigins = () => {
  const allowedOrigins = [/localhost/];

  return CORS_BASE_URL
    ? [...allowedOrigins, new URL(CORS_BASE_URL).hostname]
    : allowedOrigins;
};

app.register(cors, {
  origin: getAllowedOrigins(),
});

const mountRouters = async (appInstance) => {
  app.register(middie);
  appInstance.register(accountRouter, { prefix: `${BASE_URL}/accounts` });
  appInstance.register(userRouter, { prefix: `${BASE_URL}/users` });
};

const init = async (port = Number(PORT)) => {
  try {
    await mountRouters(app);
    logger.info(`Listening on ${port}`);
    return app.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    logger.error(err);
    return process.exit(1);
  }
};

export default {
  app,
  init,
  mountRouters,
};
