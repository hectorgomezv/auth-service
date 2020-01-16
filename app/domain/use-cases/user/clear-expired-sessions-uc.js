const { UserRepository } = require('../../repositories')
const { logger } = require('../../../infrastructure/logger');

module.exports = async () => {
  const result = await UserRepository.clearExpiredSessions();
  logger.info(`Clearing sessions: ${result}`);
};
