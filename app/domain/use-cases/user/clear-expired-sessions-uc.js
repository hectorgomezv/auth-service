const { UserRepository } = require('../../repositories');

module.exports = async () => UserRepository.clearExpiredSessions();
