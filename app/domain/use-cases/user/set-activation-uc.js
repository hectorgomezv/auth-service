import Joi from 'joi';
import { get } from 'lodash-es';
import { ROLES } from '../../config/roles-config.js';
import RbacEntity from '../../entities/rbac/rbac-entity.js';
import UserRepository from '../../repositories/user-repository.js';
import ConflictError from '../errors/conflict-error.js';
import ForbiddenActionError from '../errors/forbidden-action-error.js';
import NotFoundError from '../errors/not-found-error.js';
import { USER_NOT_FOUND } from './error-messages/error-messages.js';

const patchSchema = Joi.object()
  .keys({
    active: Joi.boolean().strict(),
  })
  .required();

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
  await patchSchema.validateAsync(patch);
  const userId = get(context, 'auth.id');

  if (userId === id) {
    throw new ConflictError('Self-(de)activation is not allowed');
  }

  const user = await UserRepository.findById(id);

  if (!user) {
    throw new NotFoundError(USER_NOT_FOUND, `id:${id}`);
  }

  await checkPermissions(context, user);

  return UserRepository.setActivationState(id, patch.active);
};

export default execute;
