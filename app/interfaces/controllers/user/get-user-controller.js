import getUser from '../../../domain/use-cases/user/get-user-uc.js';
import jsonErrorAdapter from '../../adapters/json-error-adapter.js';
import profileAdapter from '../../adapters/user/profile-adapter.js';

export default async (req, res) => {
  try {
    const { context } = req.raw;
    const { id } = req.params;
    const user = await getUser(context, id);
    res.send({ data: profileAdapter(user) });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
