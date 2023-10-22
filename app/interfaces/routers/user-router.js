import ContextEntity from '../entities/context-entity.js';
import getUserController from '../controllers/user/get-user-controller.js';
import getUsersController from '../controllers/user/get-users-controller.js';
import createUserController from '../controllers/user/create-user-controller.js';
import activationController from '../controllers/user/activation-controller.js';

export default (app, _, done) => {
  app.use('/', ContextEntity.buildContext);
  app.post('/', createUserController);
  app.get('/', {}, getUsersController);
  app.get('/:id', {}, getUserController);
  app.post('/activation/:id', {}, activationController);
  done();
};
