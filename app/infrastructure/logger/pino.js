const Pino = require('pino');

const logger = Pino({
  level: 'info',
  prettyPrint: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'hostname,pid',
  },
});

module.exports = logger;
