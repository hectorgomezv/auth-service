const faker = require('faker');

const { ROLES } = require('../../../../../app/domain/config/roles-config');

const {
  EmailRepository,
  UserRepository,
} = require('../../../../../app/domain/repositories');

const { RbacEntity } = require('../../../../../app/domain/entities/rbac');
const { createUser } = require('../../../../../app/domain/use-cases/user');
const { AccessError } = require('../../../../../app/domain/entities/errors');
const { NOT_ALLOWED } = require('../../../../../app/domain/entities/rbac/error-messages');

const {
  FORBIDDEN_SUPERADMIN_CREATION,
  OPERATION_NOT_SUPPORTED,
  USER_ALREADY_EXISTS,
} = require('../../../../../app/domain/use-cases/user/error-messages');

const CONTEXT = {
  auth: {
    role: ROLES.ADMIN.name,
  },
};

const USER = {
  email: faker.internet.email(),
  fullName: `${faker.name.firstName()} ${faker.name.lastName}`,
  avatarUrl: faker.internet.url(),
  role: 'user',
};

describe('[use-cases-tests] [user] [create-user]', () => {
  beforeEach(() => {
    RbacEntity.isUserAllowedTo = jest.fn().mockResolvedValue(true);
    UserRepository.findByEmail = jest.fn().mockResolvedValue(null);
    UserRepository.create = jest.fn().mockResolvedValue(USER);
    EmailRepository.sendRegistration = jest.fn().mockResolvedValue();
  });

  it('should fail if the executor has no permissions', async () => {
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });

    await expect(createUser(CONTEXT, USER)).rejects.toEqual(expectedError)
  });

  it('should fail if someone tries to create a superAdmin', async () => {
    await expect(createUser(CONTEXT, { ...USER, role: ROLES.SUPERADMIN.name }))
      .rejects
      .toMatchObject({
        name: 'ForbiddenActionError',
        message: FORBIDDEN_SUPERADMIN_CREATION,
      });
  });

  it("should fail if the input role isn't recognized", async () => {
    await expect(createUser(CONTEXT, {
      ...USER,
      role: 'baker',
    })).rejects.toMatchObject({
      name: 'ForbiddenActionError',
      message: OPERATION_NOT_SUPPORTED,
    });
  });

  it('should call RbacEntity with the proper params', async () => {
    await createUser(CONTEXT, USER);
    expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledTimes(1);
    expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledWith(CONTEXT, 'create', USER.role);
  });

  it('should fail if the user already exists', async () => {
    UserRepository.findByEmail.mockResolvedValue(USER);
    await expect(createUser(CONTEXT, USER)).rejects.toMatchObject({
      name: 'ConflictError',
      message: USER_ALREADY_EXISTS,
    });
  });

  it('created users should be initially inactive', async () => {
    await createUser(CONTEXT, USER);
    expect(UserRepository.create).toHaveBeenCalledTimes(1);

    expect(UserRepository.create).toHaveBeenCalledWith({
      ...USER,
      password: expect.any(String),
      active: false,
      activationCode: expect.any(String),
      sessions: [],
    });
  });

  describe('Email notifications', () => {
    it('should call EmailRepository with the address and the activationCode', async () => {
      await createUser(CONTEXT, USER);
      expect(EmailRepository.sendRegistration).toHaveBeenCalledTimes(1);

      expect(EmailRepository.sendRegistration)
        .toHaveBeenCalledWith(USER.email, expect.any(String));
    });
  });
});
