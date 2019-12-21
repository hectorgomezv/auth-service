const { ContextEntity } = require('../entities');

const {
  getUserController,
  getUsersController,
  createUserController,
} = require('../controllers/user');

module.exports = (app, opts, done) => {
  app.use('/', ContextEntity.buildContext);
  app.post('/', createUserController);
  app.get('/', {}, getUsersController);
  app.get('/:id', {}, getUserController);
  done();
};
