const app = require('fastify')({
  logger: true,
});
const { accountRouter } = require('../../interfaces/routers');

const mountRouters = () => {
  app.register(accountRouter, { prefix: '/api/account' });
};

const listen = (port = 3000) => app
  .listen(port, (err, address) => {
    if (err) throw err;
    app.log.info(`server listening on ${address}`);
  });

const init = (port) => {
  mountRouters();
  listen(port);
};

module.exports = {
  init,
};
