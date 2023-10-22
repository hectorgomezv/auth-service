import UserRepository from '../../repositories/user-repository.js';

export default async () => UserRepository.clearExpiredSessions();
