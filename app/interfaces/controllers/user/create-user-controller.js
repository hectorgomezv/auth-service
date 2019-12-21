const { jsonErrorAdapter } = require('../../adapters');
const { profileAdapter } = require('../../adapters/user');
const { createUser } = require('../../../domain/use-cases/user');

module.exports = async (req, res) => {
  try {
    const { context } = req.raw;
    const data = (req.body && req.body.data) || {};
    const user = await createUser(context, data);
    res.send({ data: profileAdapter(user) });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
