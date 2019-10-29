const baseTemplate = require('./base-template');

const { AUTH_SERVICE_URL } = process.env;

function buildRegistrationTemplate({
  title = 'Confirm Registration',
  activationCode,
}) {
  const data = {
    title,
    actionUrl: `${AUTH_SERVICE_URL}/activate?activationCode=${activationCode}`,
  };

  return baseTemplate(data);
}

module.exports = buildRegistrationTemplate;
