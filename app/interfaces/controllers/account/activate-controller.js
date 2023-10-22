import { get } from 'lodash-es';

import jsonErrorAdapter from '../../adapters/json-error-adapter.js';
import profileAdapter from '../../adapters/user/profile-adapter.js';
import activate from '../../../domain/use-cases/account/activate-uc.js';

export default async (req, res) => {
  try {
    const { data } = await activate(get(req, 'body.data'));

    return res.send(profileAdapter(data));
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
