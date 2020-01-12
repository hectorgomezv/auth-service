const { jsonErrorAdapter } = require('../../adapters');
const { resetPassword } = require('../../../domain/use-cases/account');

module.exports = async (req, res) => {
  try {
    const data = (req.body && req.body.data) || {};
    await resetPassword(data);

    return res.send();
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
