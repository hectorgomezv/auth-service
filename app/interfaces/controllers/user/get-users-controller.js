const { jsonErrorAdapter } = require('../../adapters');
const { profileAdapter } = require('../../adapters/user');
const { getUsers } = require('../../../domain/use-cases/user');

module.exports = async (req, res) => {
  try {
    const { context } = req.raw;
    const users = await getUsers(context);
    res.send({ data: users.map(u => profileAdapter(u)) });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
