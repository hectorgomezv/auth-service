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
 * Build an user model object from the data passed in.
 * @param {Object} data data to build the user model.
 * @returns {UserModel} UserModel built.
 */
const buildUserModel = async (data) => {
  const password = await bcrypt.hash(nanoid(), 10);
  const activationCode = uuidV4();

  const {
    email,
    avatarUrl,
    fullName,
    role,
  } = data;

  return {
    email,
    password,
    avatarUrl,
    fullName,
    role,
    active: false,
    activationCode,
    sessions: [],
  };
};

const execute = async (auth, data) => {
  await userValidator(data);
  await checkPermissions(auth, data);

  const user = await UserRepository.findByEmail(data.email);

  if (user) {
    throw new ConflictError(USER_ALREADY_EXISTS, `email:${data.email}`);
  }

  const userModel = await buildUserModel(data);
  const created = await UserRepository.create(userModel);

  const { email, activationCode } = created;
  await EmailRepository.sendRegistration(email, activationCode);

  return _.omit(created, 'password');
};

module.exports = execute;
