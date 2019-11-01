const AuthenticationError = require('./authentication-error');
const ConflictError = require('./conflict-error');
const ForbiddenActionError = require('./forbidden-action-error');
const NotFoundError = require('./not-found-error');
const ActivationError = require('./activation-error');

module.exports = {
  AuthenticationError,
  ConflictError,
  ForbiddenActionError,
  NotFoundError,
  ActivationError,
};
