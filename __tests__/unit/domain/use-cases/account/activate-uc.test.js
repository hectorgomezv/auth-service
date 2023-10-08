import { jest } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import UserRepository from '../../../../../app/domain/repositories/user-repository';
import activate from '../../../../../app/domain/use-cases/account/activate-uc';
import {
  ACTIVATION_CODE_NOT_FOUND,
  ALREADY_ACTIVE_ERROR,
} from '../../../../../app/domain/use-cases/account/error-messages/error-messages';

const ACTIVATION_CODE = faker.string.uuid();
const PASSWORD = faker.string.alphanumeric();

const USER = {
  email: faker.internet.email(),
  fullName: `${faker.person.firstName()} ${faker.person.lastName}`,
  avatarUrl: faker.internet.url(),
  active: false,
  role: faker.lorem.word(),
};

const DATA = {
  activationCode: ACTIVATION_CODE,
  password: PASSWORD,
  repeatedPassword: PASSWORD,
};

describe('[use-cases-tests] [account] [activate]', () => {
  beforeEach(() => {
    UserRepository.findByActivationCode = jest.fn().mockResolvedValue(USER);
    UserRepository.activate = jest.fn().mockResolvedValue({
      ...USER,
      active: true,
    });
  });

  it('should fail if the repository can find the activation code', async () => {
    UserRepository.findByActivationCode = jest.fn(() => null);
    await expect(activate(DATA)).rejects.toMatchObject({
      name: 'NotFoundError',
      message: ACTIVATION_CODE_NOT_FOUND,
      code: StatusCodes.NOT_FOUND,
    });
  });

  it('should fail if the found user is already active', async () => {
    UserRepository.findByActivationCode.mockResolvedValue({
      ...USER,
      active: true,
    });

    await expect(activate(DATA)).rejects.toMatchObject({
      name: 'ActivationError',
      message: ALREADY_ACTIVE_ERROR,
      code: StatusCodes.NOT_ACCEPTABLE,
    });
  });

  it('should activate the account', async () => {
    const result = await activate(DATA);
    expect(UserRepository.activate).toHaveBeenCalledTimes(1);
    expect(UserRepository.activate).toHaveBeenCalledWith(
      USER._id,
      expect.any(String),
    );
    expect(result).toMatchObject({
      data: {
        ...USER,
        active: true,
      },
    });
  });
});
