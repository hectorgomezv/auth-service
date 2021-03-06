const activate = require('./activate-uc');
const forgotPassword = require('./forgot-password-uc');
const login = require('./login-uc');
const refreshSession = require('./refresh-session-uc');
const resetPassword = require('./reset-password-uc');

module.exports = {
  activate,
  forgotPassword,
  login,
  refreshSession,
  resetPassword,
};
