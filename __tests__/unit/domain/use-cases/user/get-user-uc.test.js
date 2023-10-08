import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import { ObjectId } from 'mongodb';
import { ROLES } from '../../../../../app/domain/config/roles-config';
import AccessError from '../../../../../app/domain/entities/errors/access-error';
import { NOT_ALLOWED } from '../../../../../app/domain/entities/rbac/error-messages/error-messages';
import RbacEntity from '../../../../../app/domain/entities/rbac/rbac-entity';
import UserRepository from '../../../../../app/domain/repositories/user-repository';
import getUser from '../../../../../app/domain/use-cases/user/get-user-uc';

const USER = {
  _id: ObjectId(),
  email: faker.internet.email(),
  fullName: `${faker.person.firstName()} ${faker.person.lastName}`,
  avatarUrl: faker.internet.url(),
  role: 'user',
};

const CONTEXT = {
  auth: {
    id: USER._id,
    role: ROLES.ADMIN.name,
  },
};

describe('[use-cases-tests] [user] [get-user]', () => {
  beforeEach(() => {
    RbacEntity.isUserAllowedTo = jest.fn().mockResolvedValue(true);
    UserRepository.findById = jest.fn().mockResolvedValue(USER);
  });

  it('should fail if the executor has no permissions', async () => {
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });

    await expect(
      getUser(
        {
          ...CONTEXT,
          auth: {
            ...CONTEXT.auth,
            id: ObjectId(),
          },
        },
        USER._id,
      ),
    ).rejects.toEqual(expectedError);
  });

  it('should let users get their own profile', async () => {
    const expectedError = new AccessError(NOT_ALLOWED);

    RbacEntity.isUserAllowedTo = jest.fn(() => {
      throw expectedError;
    });

    const user = await getUser(CONTEXT, USER._id);
    expect(user).toEqual(USER);
  });

  it('should return the profile when the role allows to', async () => {
    const user = await getUser(
      { ...CONTEXT, auth: { ...CONTEXT.auth, id: ObjectId() } },
      USER._id,
    );
    expect(user).toEqual(USER);
  });
});
