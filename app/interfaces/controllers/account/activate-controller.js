const { jsonErrorAdapter } = require('../../adapters');
const { profileAdapter } = require('../../adapters/user');
const { activate } = require('../../../domain/use-cases/account');

module.exports = async (req, res) => {
  try {
    const {
      activationCode,
      password,
      repeatedPassword,
    } = (req.body && req.body.data) || {};

    const { data } = await activate(activationCode, password, repeatedPassword);

    return res.send(profileAdapter(data));
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
