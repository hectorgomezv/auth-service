import baseTemplate from './base-template.js';

const { BASE_URL } = process.env;

function buildResetPasswordTemplate({
  title = 'Reset password',
  resetPasswordCode,
}) {
  const data = {
    title,
    actionUrl: `${BASE_URL}/api/v1/auth/accounts/reset-password?resetPasswordCode=${resetPasswordCode}`,
  };

  return baseTemplate(data);
}

export default buildResetPasswordTemplate;
