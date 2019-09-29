const _ = require('lodash');
const bcrypt = require('bcrypt');
const nanoid = require('nanoid');
const uuidV4 = require('uuidv4');

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

const { UserRepository } = require('../../repositories');
const { RbacEntity } = require('../../entities/rbac');

const checkPermissions = async (auth, data) => {
  const { role } = data;

  if (role === 'superAdmin') {
    throw new ForbiddenActionError(FORBIDDEN_SUPERADMIN_CREATION);
  }

  if (role === 'admin') {
    return RbacEntity.isUserAllowedTo(auth, 'create', 'admin');
  }

  if (role === 'user') {
    return RbacEntity.isUserAllowedTo(auth, 'create', 'user');
  }

  throw new ForbiddenActionError(OPERATION_NOT_SUPPORTED);
};

const execute = async (auth, data) => {
  await userValidator(data);
  await checkPermissions(auth, data);

  const user = await UserRepository.findByEmail(data.email);

  if (user) {
    throw new ConflictError(USER_ALREADY_EXISTS, `email:${data.email}`);
  }

  const password = await bcrypt.hash(nanoid(), 10);
  const activationCode = uuidV4();

  // await EmailRepository.sendNewUserEmail({ email, activationCode });

  const {
    email,
    avatarUrl,
    fullName,
    role,
  } = data;

  const created = await UserRepository.create({
    email,
    password,
    avatarUrl,
    fullName,
    role,
    active: false,
    activationCode,
    sessions: [],
  });

  return _.omit(created, 'password');
};

module.exports = execute;
