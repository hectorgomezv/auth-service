import createUser from '../../../domain/use-cases/user/create-user-uc.js';
import jsonErrorAdapter from '../../adapters/json-error-adapter.js';
import profileAdapter from '../../adapters/user/profile-adapter.js';

export default async (req, res) => {
  try {
    const { context } = req.raw;
    const data = (req.body && req.body.data) || {};
    const user = await createUser(context, data);
    res.send({ data: profileAdapter(user) });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
