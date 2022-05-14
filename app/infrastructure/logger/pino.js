const Pino = require('pino');

const logger = Pino({
  level: 'info',
  timestamp: Pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
