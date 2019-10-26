const _ = require('lodash');
const bcrypt = require('bcrypt');
const nanoid = require('nanoid');
const uuidV4 = require('uuid/v4');

const { userValidator } = require('./validators');

const {
  FORBIDDEN_SUPERADMIN_CREATION,
  OPERATION_NOT_SUPPORTED,
  USER_ALREADY_EXISTS,
} = require('./error-messages');

const {
  ConflictError,
  ForbiddenActionError,
} = require('../errors');

const { ROLES } = require('../../config/roles-config');

const {
  EmailRepository,
  UserRepository,
} = require('../../repositories');

const { RbacEntity } = require('../../entities/rbac');

/**
 * Check the permissions to create a new user.
 * @param {Auth} auth auth info of the user who request the operation.
 * @param {Object} data data of the user to create.
 */
const checkPermissions = async (auth, data) => {
  const { role } = data;

  if (!Object.values(ROLES).includes(role)) {
    throw new ForbiddenActionError(OPERATION_NOT_SUPPORTED);
  }

  if (role === ROLES.SUPERADMIN) {
    throw new ForbiddenActionError(FORBIDDEN_SUPERADMIN_CREATION);
  }

  return RbacEntity.isUserAllowedTo(auth, 'create', role);
};

/**
 * Build an user object from the data passed in.
 * @param {Object} data data to build the user.
 * @returns {User} User built.
 */
const buildUser = async (data) => {
  const password = await bcrypt.hash(nanoid(), 10);
  const activationCode = uuidV4();

  const {
    email,
    fullName,
    role,
  } = data;

  return {
    email,
    password,
    fullName,
    role,
    active: false,
    activationCode,
    sessions: [],
  };
};

/**
 * Creates a new user.
 * @param {Auth} auth auth info of the user who request the operation.
 * @param {Object} data data to fill the new user profile.
 */
const execute = async (auth, data) => {
  await userValidator(data);
  await checkPermissions(auth, data);

  const user = await UserRepository.findByEmail(data.email);

  if (user) {
    throw new ConflictError(USER_ALREADY_EXISTS, `email:${data.email}`);
  }

  const userModel = await buildUser(data);
  const created = await UserRepository.create(userModel);

  const { email, activationCode } = created;
  await EmailRepository.sendRegistration(email, activationCode);

  return created;
};

module.exports = execute;
