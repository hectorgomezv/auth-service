import baseTemplate from './base-template.js';

const { BASE_URL } = process.env;

function buildRegistrationTemplate({
  title = 'Confirm Registration',
  activationCode,
}) {
  const data = {
    title,
    actionUrl: `${BASE_URL}/api/v1/auth/accounts/activate?activationCode=${activationCode}`,
  };

  return baseTemplate(data);
}

export default buildRegistrationTemplate;
