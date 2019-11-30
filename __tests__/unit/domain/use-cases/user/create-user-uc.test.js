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

const ROLE = ROLES.ADMIN.name;

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

  it('should fail if the executor has no permissions to create users', async (done) => {
    const expectedError = new AccessError(NOT_ALLOWED);
    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });

    try {
      await createUser({ role: ROLE }, USER);
      done.fail();
    } catch (err) {
      expect(err).toEqual(expectedError);
      done();
    }
  });

  it('should fail if someone tries to create a superAdmin', async (done) => {
    try {
      await createUser({ role: ROLE }, {
        ...USER,
        role: ROLES.SUPERADMIN.name,
      });
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        name: 'ForbiddenActionError',
        message: FORBIDDEN_SUPERADMIN_CREATION,
      });
      done();
    }
  });

  it("should fail if the input role isn't recognized", async (done) => {
    try {
      await createUser({ role: ROLE }, {
        ...USER,
        role: 'baker',
      });
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        name: 'ForbiddenActionError',
        message: OPERATION_NOT_SUPPORTED,
      });
      done();
    }
  });

  it('should call RbacEntity with the proper params', async () => {
    await createUser({ role: ROLE }, USER);
    expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledTimes(1);
    expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledWith({ role: ROLE }, 'create', USER.role);
  });

  it('should fail if the user already exists', async (done) => {
    UserRepository.findByEmail.mockResolvedValue(USER);
    try {
      await createUser({ role: ROLE }, USER);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        name: 'ConflictError',
        message: USER_ALREADY_EXISTS,
      });
      done();
    }
  });

  it('created users should be initially inactive', async () => {
    await createUser({ role: ROLE }, USER);
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
      await createUser({ role: ROLE }, USER);
      expect(EmailRepository.sendRegistration).toHaveBeenCalledTimes(1);
      expect(EmailRepository.sendRegistration)
        .toHaveBeenCalledWith(USER.email, expect.any(String));
    });
  });
});
