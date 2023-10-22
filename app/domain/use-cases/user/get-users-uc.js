import RbacEntity from '../../entities/rbac/rbac-entity.js';
import UserRepository from '../../repositories/user-repository.js';

/**
 * Get user by Id from the user repository.
 * @param {Context} execution context.
 */
const execute = async (context) => {
  await RbacEntity.isUserAllowedTo(context, 'read', 'user');

  return UserRepository.find();
};

export default execute;
