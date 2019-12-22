const _ = require('lodash');

const { ConflictError, ForbiddenActionError } = require('../errors');
const { UserRepository } = require('../../repositories');
const { RbacEntity } = require('../../entities/rbac');
const { ROLES } = require('../../config/roles-config');

/**
 * Checks permissions for deactivation.
 * @param {Context} execution context.
 * @param {User} user user to deactivate.
 */
const checkPermissions = async (context, user) => {
  if (user.role === ROLES.SUPERADMIN.name) {
    throw new ForbiddenActionError('Not allowed deactivation');
  }

  if (user.role === ROLES.ADMIN.name) {
    await RbacEntity.isUserAllowedTo(context, 'delete', 'admin');
  } else {
    await RbacEntity.isUserAllowedTo(context, 'delete', 'user');
  }
};


/**
 * Deactivates a user.
 * @param {Context} execution context.
 * @param {Object} data data to fill the new user profile.
 */
const execute = async (context, id) => {
  const userId = _.get(context, 'auth.id');

  if (userId === id) {
    throw new ConflictError('Self-deactivation is not allowed');
  }

  const user = await UserRepository.findById(id);
  await checkPermissions(context, user);

  return UserRepository.deactivate(id);
};

module.exports = execute;
