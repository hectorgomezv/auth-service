const { RbacEntity } = require('../../entities/rbac');
const { UserRepository } = require('../../../../app/domain/repositories');

/**
 * Get user by Id from the user repository.
 * @param {Auth} auth auth info of the user who request the operation.
 */
const execute = async (auth) => {
  await RbacEntity.isUserAllowedTo(auth, 'read', 'user');

  return UserRepository.find();
};

module.exports = execute;
