const pino = require('pino');
const config = require('./pino-config');

module.exports = pino(config);
