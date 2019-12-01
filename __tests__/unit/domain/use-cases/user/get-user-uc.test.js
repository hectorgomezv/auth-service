const faker = require('faker');
const { ObjectId } = require('mongodb');

const { RbacEntity } = require('../../../../../app/domain/entities/rbac');
const { UserRepository } = require('../../../../../app/domain/repositories');
const { getUser } = require('../../../../../app/domain/use-cases/user');
const { AccessError } = require('../../../../../app/domain/entities/errors');
const { NOT_ALLOWED } = require('../../../../../app/domain/entities/rbac/error-messages');
const { ROLES } = require('../../../../../app/domain/config/roles-config');

const ROLE = ROLES.ADMIN.name;

const USER = {
  _id: ObjectId(),
  email: faker.internet.email(),
  fullName: `${faker.name.firstName()} ${faker.name.lastName}`,
  avatarUrl: faker.internet.url(),
  role: 'user',
};

describe('[use-cases-tests] [user] [get-user]', () => {
  beforeEach(() => {
    RbacEntity.isUserAllowedTo = jest.fn().mockResolvedValue(true);
    UserRepository.findById = jest.fn().mockResolvedValue(USER);
  });

  it('should fail if the executor has no permissions', async (done) => {
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });

    try {
      await getUser({ id: ObjectId(), role: ROLE }, USER._id);
      done.fail();
    } catch (err) {
      expect(err).toEqual(expectedError);
      done();
    }
  });

  it('should let users get their own profile', async () => {
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });

    const user = await getUser({ id: USER._id, role: ROLE }, USER._id);
    expect(user).toEqual(USER);
  });

  it('should return the profile when the role allows to', async () => {
    const user = await getUser({ id: ObjectId(), role: ROLE }, USER._id);
    expect(user).toEqual(USER);
  });
});
