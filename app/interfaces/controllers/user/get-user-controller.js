const { jsonErrorAdapter } = require('../../adapters');
const { profileAdapter } = require('../../adapters/user');
const { getUser } = require('../../../domain/use-cases/user');

module.exports = async (req, res) => {
  try {
    const { context } = req.raw;
    const { id } = req.params;
    const user = await getUser(context, id);
    res.send({ data: profileAdapter(user) });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
