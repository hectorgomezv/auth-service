import jsonErrorAdapter from '../../adapters/json-error-adapter.js';
import profileAdapter from '../../adapters/user/profile-adapter.js';
import login from '../../../domain/use-cases/account/login-uc.js';

export default async (req, res) => {
  try {
    const data = (req.body && req.body.data) || {};
    const {
      data: { user, ...rest },
    } = await login(data);

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
