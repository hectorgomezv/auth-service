import { get } from 'lodash-es';
import RbacEntity from '../../entities/rbac/rbac-entity.js';
import UserRepository from '../../repositories/user-repository.js';
import NotFoundError from '../errors/not-found-error.js';
import { USER_NOT_FOUND } from './error-messages/error-messages.js';

/**
 * Get user by Id from the user repository.
 * @param {Context} execution context.
 */
const execute = async (context, id) => {
  const userId = get(context, 'auth.id');

  if (userId !== id) {
    await RbacEntity.isUserAllowedTo(context, 'read', 'user');
  }

  const user = await UserRepository.findById(id);

  if (!user) {
    throw new NotFoundError(USER_NOT_FOUND, `user:${id}`);
  }

  return user;
};

export default execute;
