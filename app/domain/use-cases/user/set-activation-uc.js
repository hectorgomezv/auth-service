const _ = require('lodash');
const Joi = require('@hapi/joi');

const { NotFoundError, ConflictError, ForbiddenActionError } = require('../errors');
const { USER_NOT_FOUND } = require('./error-messages');
const { RbacEntity } = require('../../entities/rbac');
const { UserRepository } = require('../../repositories');
const { ROLES } = require('../../config/roles-config');

const patchSchema = Joi.object().keys({
  active: Joi.boolean().strict(),
}).required();

/**
 * Checks permissions for set-activation.
 * @param {Context} execution context.
 * @param {User} user user to change its activation status.
 */
const checkPermissions = async (context, user) => {
  if (user.role === ROLES.SUPERADMIN.name) {
    throw new ForbiddenActionError('Not allowed (de)activation');
  }

  if (user.role === ROLES.ADMIN.name) {
    await RbacEntity.isUserAllowedTo(context, 'delete', 'admin');
  } else {
    await RbacEntity.isUserAllowedTo(context, 'delete', 'user');
  }
};

/**
 * Sets the activation state of an user.
 * @param {Context} execution context.
 * @param {String} id id of the user to be modified.
 * @param {Object} patch patch to apply.
 */
const execute = async (context, id, patch) => {
  await patchSchema.validate(patch);
  const userId = _.get(context, 'auth.id');

  if (userId === id) {
    throw new ConflictError('Self-(de)activation is not allowed');
  }

  const user = await UserRepository.findById(id);

  if (!user) {
    throw new NotFoundError(USER_NOT_FOUND, `id:${id}`);
  }

  await checkPermissions(context, user);

  return UserRepository.setActivationState(id, patch);
};

module.exports = execute;
