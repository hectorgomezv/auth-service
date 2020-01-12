const { jsonErrorAdapter } = require('../../adapters');
const { forgotPassword } = require('../../../domain/use-cases/account');

module.exports = async (req, res) => {
  try {
    const data = (req.body && req.body.data) || {};
    await forgotPassword(data);

    return res.send();
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
