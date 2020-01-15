const activationValidator = require('./activation-validator');
const emailValidator = require('./email-validator');
const loginValidator = require('./login-validator');
const refreshSessionValidator = require('./refresh-session-validator');
const resetPasswordValidator = require('./reset-password-validator');

module.exports = {
  activationValidator,
  emailValidator,
  loginValidator,
  refreshSessionValidator,
  resetPasswordValidator,
};
