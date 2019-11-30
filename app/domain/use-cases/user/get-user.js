const { NotFoundError } = require('../errors');
const { USER_NOT_FOUND } = require('./error-messages');
const { RbacEntity } = require('../../entities/rbac');
const { UserRepository } = require('../../../../app/domain/repositories');

/**
 * Get user by Id from the user repository.
 * @param {Auth} auth auth info of the user who request the operation.
 */
const execute = async (id, auth) => {
  await RbacEntity.isUserAllowedTo(auth, 'read', 'user');
  const user = await UserRepository.findById(id);
  if (!user) {
    throw new NotFoundError(USER_NOT_FOUND, `user:${id}`);
  }

  return user;
};

module.exports = execute;
