import getUsers from '../../../domain/use-cases/user/get-users-uc.js';
import jsonErrorAdapter from '../../adapters/json-error-adapter.js';
import profileAdapter from '../../adapters/user/profile-adapter.js';

export default async (req, res) => {
  try {
    const { context } = req.raw;
    const users = await getUsers(context);
    res.send({ data: users.map((u) => profileAdapter(u)) });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
