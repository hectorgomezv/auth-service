const activationValidator = require('./activation-validator');
const emailValidator = require('./email-validator');
const loginValidator = require('./login-validator');
const resetPasswordValidator = require('./reset-password-validator');

module.exports = {
  activationValidator,
  emailValidator,
  loginValidator,
  resetPasswordValidator,
};
