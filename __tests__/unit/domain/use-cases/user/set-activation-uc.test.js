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

  it("should not let de user modify it's own status", async () => {
    await expect(setActivation(CONTEXT, CONTEXT.auth.id, PATCH)).rejects.toThrow({
      message: 'Self-(de)activation is not allowed',
      code: CONFLICT,
    });
  });

  it('should not let the user to (de)activate a superadmin', async () => {
    UserRepository.findById.mockResolvedValue({ ...USER, role: ROLES.SUPERADMIN.name });
    await expect(setActivation(CONTEXT, USER._id, PATCH)).rejects.toThrow({
      message: 'Not allowed (de)activation',
      code: FORBIDDEN,
    });
  });

  it('should check the user has permissions when (de)activating an admin', async () => {
    UserRepository.findById.mockResolvedValue({ ...USER, role: ROLES.ADMIN.name });
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });

    await expect(setActivation(CONTEXT, USER._id, PATCH)).rejects.toThrow();
    expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledTimes(1);
    expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledWith(CONTEXT, 'delete', 'admin');
  });

  it('should check the user has permissions when (de)activating a user', async () => {
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });

    await expect(setActivation(CONTEXT, USER._id, PATCH)).rejects.toThrow();
    expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledTimes(1);
    expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledWith(CONTEXT, 'delete', 'user');
  });

  it('should fail if the patch is malformed', async () => {
    await expect(setActivation(CONTEXT, USER._id, 1)).rejects.toThrow();
  });

  it('should call repository to (de)activate the user', async () => {
    await setActivation(CONTEXT, USER._id, PATCH);
    expect(UserRepository.setActivationState).toHaveBeenCalledTimes(1);
    expect(UserRepository.setActivationState).toHaveBeenCalledWith(USER._id, PATCH);
  });
});
