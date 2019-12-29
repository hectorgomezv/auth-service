const faker = require('faker');
const { ObjectId } = require('mongodb');
const { CONFLICT, FORBIDDEN, NOT_ALLOWED } = require('http-status-codes');

const { ROLES } = require('../../../../../app/domain/config/roles-config');
const { setActivation } = require('../../../../../app/domain/use-cases/user');
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

const PATCH = {
  active: true,
};

describe('[use-cases-tests] [user] [set-activation]', () => {
  beforeEach(() => {
    UserRepository.findById = jest.fn().mockResolvedValue(USER);
    UserRepository.setActivationState = jest.fn().mockResolvedValue(USER);
    RbacEntity.isUserAllowedTo = jest.fn().mockResolvedValue(true);
  });

  it("should not let de user modify it's own status", async (done) => {
    try {
      await setActivation(CONTEXT, CONTEXT.auth.id, PATCH);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        message: 'Self-(de)activation is not allowed',
        code: CONFLICT,
      });
      done();
    }
  });

  it('should not let the user to (de)activate a superadmin', async (done) => {
    UserRepository.findById.mockResolvedValue({ ...USER, role: ROLES.SUPERADMIN.name });

    try {
      await setActivation(CONTEXT, USER._id, PATCH);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        message: 'Not allowed (de)activation',
        code: FORBIDDEN,
      });
      done();
    }
  });

  it('should check the user has permissions when (de)activating an admin', async (done) => {
    UserRepository.findById.mockResolvedValue({ ...USER, role: ROLES.ADMIN.name });
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });


    try {
      await setActivation(CONTEXT, USER._id, PATCH);
      done.fail();
    } catch (err) {
      expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledTimes(1);
      expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledWith(CONTEXT, 'delete', 'admin');
      done();
    }
  });

  it('should check the user has permissions when (de)activating a user', async (done) => {
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });

    try {
      await setActivation(CONTEXT, USER._id, PATCH);
      done.fail();
    } catch (err) {
      expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledTimes(1);
      expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledWith(CONTEXT, 'delete', 'user');
      done();
    }
  });

  it('should fail if the patch is malformed', async (done) => {
    try {
      await setActivation(CONTEXT, USER._id, 1);
      done.fail();
    } catch (err) {
      expect(err).toMatchObject({
        message: '',
      });
      done();
    }
  });

  it('should call repository to (de)activate the user', async () => {
    await setActivation(CONTEXT, USER._id, PATCH);
    expect(UserRepository.setActivationState).toHaveBeenCalledTimes(1);
    expect(UserRepository.setActivationState).toHaveBeenCalledWith(USER._id, PATCH);
  });
});
