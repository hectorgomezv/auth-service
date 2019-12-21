const _ = require('lodash');

const { jsonErrorAdapter } = require('../../adapters');
const { profileAdapter } = require('../../adapters/user');
const { activate } = require('../../../domain/use-cases/account');

module.exports = async (req, res) => {
  try {
    const { data } = await activate(_.get(req, 'body.data'));

    return res.send(profileAdapter(data));
  } catch (err) {
    throw jsonErrorAdapter(err);
  }
};
