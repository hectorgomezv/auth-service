const { login } = require('../../../domain/use-cases/account');
const { jsonErrorAdapter } = require('../../adapters');

module.exports = async (req, res) => {
  try {
    const data = (req.body && req.body.data) || {};
    const result = await login(data);
    res.send(result);
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
