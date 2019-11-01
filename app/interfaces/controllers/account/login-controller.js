const { jsonErrorAdapter } = require('../../adapters');
const { profileAdapter } = require('../../adapters/user');
const { login } = require('../../../domain/use-cases/account');

module.exports = async (req, res) => {
  try {
    const data = (req.body && req.body.data) || {};
    const { data: { user, ...rest } } = await login(data);

    return res.send({
      data: {
        ...rest,
        user: profileAdapter(user),
      },
    });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
