const Joi = require('@hapi/joi');
const { RBAC } = require('rbac');

const {
  AUTH_NOT_INITIALIZED,
  NOT_ALLOWED,
} = require('./error-messages');

const { RbacConfig } = require('../../config');
const { AccessError } = require('../errors');

let rbac;

const authSchema = Joi.object().keys({
  id: Joi.string().required(),
  email: Joi.string().email().required(),
  roles: Joi.array().items(Joi.string().strict()).unique().required(),
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
 * @param {Auth} auth auth object to check.
 * @param {String} action action to check.
 * @param {String} resource resource name to check.
 * @returns {Boolean} true indicating the user is authorized.
 * @throws UnauthorizedError if rbac is not initialized or the user
 * is unauthorized.
 */
async function isUserAllowedTo(auth, action, resource) {
  if (!rbac) {
    throw new AccessError(AUTH_NOT_INITIALIZED);
  }
  await Joi.validate(auth, authSchema);
  const [roles] = auth.roles;
  const can = await rbac.can(roles, action, resource);
  if (!can) {
    throw new AccessError(NOT_ALLOWED);
  }
  return true;
}

module.exports = {
  init,
  isUserAllowedTo,
};
