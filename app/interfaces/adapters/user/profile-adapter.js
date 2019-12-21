const _ = require('lodash');

/**
 * Builds a profile object from an user object.
 * @param {User} user user to build profile.
 */
module.exports = (user) => _.pick(user, [
  '_id',
  'avatarUrl',
  'email',
  'fullName',
  'role',
  'activationCode',
]);
