const { jsonErrorAdapter } = require('../../adapters');
const { refreshSession } = require('../../../domain/use-cases/account');

module.exports = async (req, res) => {
  try {
    const { context } = req.raw;
    const data = (req.body && req.body.data) || {};
    const session = await refreshSession(context, data);

    return res.send(session);
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
