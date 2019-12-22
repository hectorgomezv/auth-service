const faker = require('faker');
const { ObjectId } = require('mongodb');
const { CONFLICT, FORBIDDEN, NOT_ALLOWED } = require('http-status-codes');

const { ROLES } = require('../../../../../app/domain/config/roles-config');
const { deactivateUser } = require('../../../../../app/domain/use-cases/user');
const { UserRepository } = require('../../../../../app/domain/repositories');
const { RbacEntity } = require('../../../../../app/domain/entities/rbac');
const { AccessError } = require('../../../../../app/domain/entities/errors');

const USER = {
  _id: ObjectId().toString(),
  email: faker.internet.email(),
  fullName: `${faker.name.firstName()} ${faker.name.lastName}`,
  avatarUrl: faker.internet.url(),
  role: ROLES.USER.name,
};

const CONTEXT = {
  auth: {
    id: ObjectId().toString(),
    role: ROLES.ADMIN.name,
  },
};

describe('[use-cases-tests] [user] [deactivate-user]', () => {
  beforeEach(() => {
    UserRepository.findById = jest.fn().mockResolvedValue(USER);
    UserRepository.deactivate = jest.fn().mockResolvedValue(USER);
    RbacEntity.isUserAllowedTo = jest.fn().mockResolvedValue(true);
  });

  it('should not let de user deactivate himself', async (done) => {
    try {
      await deactivateUser(CONTEXT, CONTEXT.auth.id);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        message: 'Self-deactivation is not allowed',
        code: CONFLICT,
      });
      done();
    }
  });

  it('should not let the user to deactivate a superadmin', async (done) => {
    UserRepository.findById.mockResolvedValue({ ...USER, role: ROLES.SUPERADMIN.name });

    try {
      await deactivateUser(CONTEXT, USER._id);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        message: 'Not allowed deactivation',
        code: FORBIDDEN,
      });
      done();
    }
  });

  it('should check the user has permissions when deactivating an admin', async (done) => {
    UserRepository.findById.mockResolvedValue({ ...USER, role: ROLES.ADMIN.name });
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });


    try {
      await deactivateUser(CONTEXT, USER._id);
      done.fail();
    } catch (err) {
      expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledTimes(1);
      expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledWith(CONTEXT, 'delete', 'admin');
      done();
    }
  });

  it('should check the user has permissions when deactivating a user', async (done) => {
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });

    try {
      await deactivateUser(CONTEXT, USER._id);
      done.fail();
    } catch (err) {
      expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledTimes(1);
      expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledWith(CONTEXT, 'delete', 'user');
      done();
    }
  });

  it('should call repository to deactivate the user', async () => {
    await deactivateUser(CONTEXT, USER._id);
    expect(UserRepository.deactivate).toHaveBeenCalledTimes(1);
    expect(UserRepository.deactivate).toHaveBeenCalledWith(USER._id);
  });
});
