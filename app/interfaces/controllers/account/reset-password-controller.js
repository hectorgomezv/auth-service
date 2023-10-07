import jsonErrorAdapter from '../../adapters/json-error-adapter.js';
import resetPassword from '../../../domain/use-cases/account/reset-password-uc.js';

export default async (req, res) => {
  try {
    const data = (req.body && req.body.data) || {};
    await resetPassword(data);

    return res.send();
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
