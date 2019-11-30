const { RbacEntity } = require('../../entities/rbac');
const { UserRepository } = require('../../../../app/domain/repositories');

/**
 * Get user by Id from the user repository.
 * @param {Auth} auth auth info of the user who request the operation.
 */
const execute = async (id, auth) => {
  await RbacEntity.isUserAllowedTo(auth, 'read', 'user');

  return UserRepository.findById(id);
};

module.exports = execute;