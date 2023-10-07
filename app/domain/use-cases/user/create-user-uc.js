import { nanoid } from 'nanoid';

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ROLES } from '../../config/roles-config.js';
import RbacEntity from '../../entities/rbac/rbac-entity.js';
import EmailRepository from '../../repositories/email-repository.js';
import UserRepository from '../../repositories/user-repository.js';
import ConflictError from '../errors/conflict-error.js';
import ForbiddenActionError from '../errors/forbidden-action-error.js';
import {
  FORBIDDEN_SUPERADMIN_CREATION,
  OPERATION_NOT_SUPPORTED,
  USER_ALREADY_EXISTS,
} from './error-messages/error-messages.js';
import userValidator from './validators/user-validator.js';

/**
 * Check the permissions to create a new user.
 * @param {Context} execution context.
 * @param {Object} data data of the user to create.
 */
const checkPermissions = async (context, data) => {
  const { role } = data;

  if (
    !Object.values(ROLES)
      .map((r) => r.name)
      .includes(role)
  ) {
    throw new ForbiddenActionError(OPERATION_NOT_SUPPORTED);
  }

  if (role === ROLES.SUPERADMIN.name) {
    throw new ForbiddenActionError(FORBIDDEN_SUPERADMIN_CREATION);
  }

  return RbacEntity.isUserAllowedTo(context, 'create', role);
};

/**
 * Build an user object from the data passed in.
 * @param {Object} data data to build the user.
 * @returns {User} User built.
 */
const buildUser = async (data) => {
  const password = await bcrypt.hash(nanoid(), 10);
  const activationCode = uuidv4();

  const { email, avatarUrl, fullName, role } = data;

  return {
    email,
    password,
    fullName,
    role,
    active: false,
    activationCode,
    sessions: [],
    ...(avatarUrl && { avatarUrl }),
  };
};

/**
 * Creates a new user.
 * @param {Context} execution context.
 * @param {Object} data data to fill the new user profile.
 */
export default async (context, data) => {
  await userValidator(data);
  await checkPermissions(context, data);

  const existentUser = await UserRepository.findByEmail(data.email);

  if (existentUser) {
    throw new ConflictError(USER_ALREADY_EXISTS, `email:${data.email}`);
  }

  const user = await buildUser(data);
  const { email, activationCode } = user;
  await EmailRepository.sendRegistration(email, activationCode);
  await UserRepository.create(user);

  return user;
};
