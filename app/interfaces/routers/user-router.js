const { ContextEntity } = require('../entities');

const {
  getUserController,
  getUsersController,
  createUserController,
  activationController,
} = require('../controllers/user');

module.exports = (app, _, done) => {
  app.use('/', ContextEntity.buildContext);
  app.post('/', createUserController);
  app.get('/', {}, getUsersController);
  app.get('/:id', {}, getUserController);
  app.post('/activation/:id', {}, activationController);
  done();
};
