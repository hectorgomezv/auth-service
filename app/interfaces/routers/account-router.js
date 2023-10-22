import ContextEntity from '../entities/context-entity.js';
import activateController from '../controllers/account/activate-controller.js';
import forgotPasswordController from '../controllers/account/forgot-password-controller.js';
import loginController from '../controllers/account/login-controller.js';
import refreshSessionController from '../controllers/account/refresh-session-controller.js';
import resetPasswordController from '../controllers/account/reset-password-controller.js';

export default (app, _, done) => {
  app.post('/activate', activateController);
  app.post('/forgot-password', forgotPasswordController);
  app.post('/login', loginController);
  app.use('/refresh-session', ContextEntity.buildContext);
  app.post('/refresh-session', {}, refreshSessionController);
  app.post('/reset-password', resetPasswordController);
  done();
};
