const baseTemplate = require('./base-template');

const { BASE_URL } = process.env;

function buildResetPasswordTemplate({
  title = 'Reset password',
  resetPasswordCode,
}) {
  const data = {
    title,
    actionUrl: `${BASE_URL}:accounts/reset-password?resetPasswordCode=${resetPasswordCode}`,
  };

  return baseTemplate(data);
}

module.exports = buildResetPasswordTemplate;
