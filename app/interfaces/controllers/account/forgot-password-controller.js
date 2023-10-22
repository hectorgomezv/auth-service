import jsonErrorAdapter from '../../adapters/json-error-adapter.js';
import forgotPassword from '../../../domain/use-cases/account/forgot-password-uc.js';

export default async (req, res) => {
  try {
    const data = (req.body && req.body.data) || {};
    await forgotPassword(data);

    return res.send();
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
