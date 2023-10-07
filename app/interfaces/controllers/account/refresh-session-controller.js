import jsonErrorAdapter from '../../adapters/json-error-adapter.js';
import refreshSession from '../../../domain/use-cases/account/refresh-session-uc.js';

export default async (req, res) => {
  try {
    const {
      context: {
        auth: { accessToken },
      },
    } = req.raw;
    const data = (req.body && req.body.data) || {};
    const session = await refreshSession({
      ...data,
      accessToken,
    });

    return res.send(session);
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
