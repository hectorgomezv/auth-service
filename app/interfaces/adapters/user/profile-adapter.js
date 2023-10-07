import { pick } from 'lodash-es';

/**
 * Builds a profile object from an user object.
 * @param {User} user user to build profile.
 */
export default (user) =>
  pick(user, [
    '_id',
    'avatarUrl',
    'email',
    'fullName',
    'role',
    'activationCode',
  ]);
