const { RbacEntity } = require('../../entities/rbac');
const { UserRepository } = require('../../repositories');

/**
 * Get user by Id from the user repository.
 * @param {Context} execution context.
 */
const execute = async (context) => {
  await RbacEntity.isUserAllowedTo(context, 'read', 'user');

  return UserRepository.find();
};

module.exports = execute;
