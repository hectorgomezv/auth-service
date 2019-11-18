const { AuthEntity } = require('../entities');

const {
  getUserController,
  getUsersController,
  createUserController,
} = require('../controllers/user');

module.exports = (app, opts, done) => {
  app.use('/', AuthEntity.addAuthHeader);
  app.post('/', createUserController);
  app.get('/', {}, getUsersController);
  app.get('/:id', {}, getUserController);
  done();
};
