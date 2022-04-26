const baseTemplate = require('./base-template');

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

module.exports = buildRegistrationTemplate;
