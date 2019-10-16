const { AuthEntity } = require('../entities');
const { createUserController } = require('../controllers/user');

module.exports = (app, opts, done) => {
  app.use('/', AuthEntity.addAuthHeader);
  app.post('/', createUserController);
  done();
};
