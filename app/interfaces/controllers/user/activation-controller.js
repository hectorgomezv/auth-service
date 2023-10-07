import setActivation from '../../../domain/use-cases/user/set-activation-uc.js';
import jsonErrorAdapter from '../../adapters/json-error-adapter.js';
import profileAdapter from '../../adapters/user/profile-adapter.js';

export default async (req, res) => {
  try {
    const { context } = req.raw;
    const { id } = req.params;
    const patch = (req.body && req.body.data) || {};
    const user = await setActivation(context, id, patch);
    res.send({ data: profileAdapter(user) });
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
