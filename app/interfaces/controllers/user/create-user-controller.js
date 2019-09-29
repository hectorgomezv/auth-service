const { jsonErrorAdapter } = require('../../adapters');
const { profileAdapter } = require('../../adapters/user');
const { createUser } = require('../../../domain/use-cases/user');

module.exports = async (req, res) => {
  try {
    const data = (req.body && req.body.data) || {};
    const user = await createUser(data);
    res.send({ data: profileAdapter(user) });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
