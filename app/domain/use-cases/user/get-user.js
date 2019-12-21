const _ = require('lodash');

const { NotFoundError } = require('../errors');
const { USER_NOT_FOUND } = require('./error-messages');
const { RbacEntity } = require('../../entities/rbac');
const { UserRepository } = require('../../../../app/domain/repositories');

/**
 * Get user by Id from the user repository.
 * @param {Context} execution context.
 */
const execute = async (context, id) => {
  const userId = _.get(context, 'auth.id');
  if (userId !== id) {
    await RbacEntity.isUserAllowedTo(context, 'read', 'user');
  }
  const user = await UserRepository.findById(id);

  if (!user) {
    throw new NotFoundError(USER_NOT_FOUND, `user:${id}`);
  }

  return user;
};

module.exports = execute;
