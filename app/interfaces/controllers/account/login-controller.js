const { jsonErrorAdapter } = require('../../adapters');
const { profileAdapter } = require('../../adapters/user');
const { login } = require('../../../domain/use-cases/account');

module.exports = async (req, res) => {
  try {
    const data = (req.body && req.body.data) || {};
    const result = await login(data);
    res.send({
      ...result,
      user: profileAdapter(result.user),
    });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
