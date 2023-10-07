import jsonErrorAdapter from '../../adapters/json-error-adapter.js';
const { profileAdapter } = require('../../adapters/user');
const { deactivateUser } = require('../../../domain/use-cases/user');

export default async (req, res) => {
  try {
    const { context } = req.raw;
    const { id } = req.params;
    const user = await deactivateUser(context, id);
    res.send({ data: profileAdapter(user) });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
