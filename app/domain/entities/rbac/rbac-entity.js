import Joi from 'joi';
import { RBAC } from 'rbac';
import {
  AUTH_NOT_INITIALIZED,
  NOT_ALLOWED,
} from './error-messages/error-messages.js';
import RbacConfig from '../../config/rbac-config.js';
import AccessError from '../errors/access-error.js';

let rbac;

const authSchema = Joi.object().keys({
  id: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().strict().required(),
  exp: Joi.number().required(),
  accessToken: Joi.string().required(),
});

/**
 * Returns rbac object initialized.
 * On first call, rbac object is retrieved from configuration.
 * On subsequent calls, rbac is picked up from memory.
 * @returns RBAC object initialized, holding configured roles and permissions.
 */
const init = async () => {
  if (!rbac) {
    rbac = new RBAC(RbacConfig);
    await rbac.init();
  }

  return rbac;
};

/**
 * Checks if the provided user role has permission to perform the passed
 * action over the passed resource name.
 * @param {Context} execution context.
 * @param {String} action action to check.
 * @param {String} resource resource name to check.
 * @returns {Boolean} true indicating the user is authorized.
 * @throws UnauthorizedError if rbac is not initialized or the user
 * is unauthorized.
 */
async function isUserAllowedTo(context, action, resource) {
  const { auth } = context;

  if (!rbac) {
    throw new AccessError(AUTH_NOT_INITIALIZED);
  }

  await authSchema.validate(auth);
  const can = await rbac.can(auth.role, action, resource);

  if (!can) {
    throw new AccessError(NOT_ALLOWED);
  }

  return true;
}

export default {
  init,
  isUserAllowedTo,
};
