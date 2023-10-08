import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import { ROLES } from '../../../../../app/domain/config/roles-config';
import AccessError from '../../../../../app/domain/entities/errors/access-error';
import { NOT_ALLOWED } from '../../../../../app/domain/entities/rbac/error-messages/error-messages';
import RbacEntity from '../../../../../app/domain/entities/rbac/rbac-entity';
import EmailRepository from '../../../../../app/domain/repositories/email-repository';
import UserRepository from '../../../../../app/domain/repositories/user-repository';
import createUserUc from '../../../../../app/domain/use-cases/user/create-user-uc';
import {
  FORBIDDEN_SUPERADMIN_CREATION,
  OPERATION_NOT_SUPPORTED,
  USER_ALREADY_EXISTS,
} from '../../../../../app/domain/use-cases/user/error-messages/error-messages';

const CONTEXT = {
  auth: {
    role: ROLES.ADMIN.name,
  },
};

const USER = {
  email: faker.internet.email(),
  fullName: `${faker.person.firstName()} ${faker.person.lastName}`,
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

    await expect(createUserUc(CONTEXT, USER)).rejects.toEqual(expectedError);
  });

  it('should fail if someone tries to create a superAdmin', async () => {
    await expect(
      createUserUc(CONTEXT, { ...USER, role: ROLES.SUPERADMIN.name }),
    ).rejects.toMatchObject({
      name: 'ForbiddenActionError',
      message: FORBIDDEN_SUPERADMIN_CREATION,
    });
  });

  it("should fail if the input role isn't recognized", async () => {
    await expect(
      createUserUc(CONTEXT, {
        ...USER,
        role: 'baker',
      }),
    ).rejects.toMatchObject({
      name: 'ForbiddenActionError',
      message: OPERATION_NOT_SUPPORTED,
    });
  });

  it('should call RbacEntity with the proper params', async () => {
    await createUserUc(CONTEXT, USER);
    expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledTimes(1);
    expect(RbacEntity.isUserAllowedTo).toHaveBeenCalledWith(
      CONTEXT,
      'create',
      USER.role,
    );
  });

  it('should fail if the user already exists', async () => {
    UserRepository.findByEmail.mockResolvedValue(USER);
    await expect(createUserUc(CONTEXT, USER)).rejects.toMatchObject({
      name: 'ConflictError',
      message: USER_ALREADY_EXISTS,
    });
  });

  it('created users should be initially inactive', async () => {
    await createUserUc(CONTEXT, USER);
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
      await createUserUc(CONTEXT, USER);
      expect(EmailRepository.sendRegistration).toHaveBeenCalledTimes(1);

      expect(EmailRepository.sendRegistration).toHaveBeenCalledWith(
        USER.email,
        expect.any(String),
      );
    });
  });
});
