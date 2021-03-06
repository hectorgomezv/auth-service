const { ContextEntity } = require('../entities');

const {
  activateController,
  forgotPasswordController,
  loginController,
  refreshSessionController,
  resetPasswordController,
} = require('../controllers/account');

module.exports = (app, _, done) => {
  app.post('/activate', activateController);
  app.post('/forgot-password', forgotPasswordController);
  app.post('/login', loginController);
  app.use('/refresh-session', ContextEntity.buildContext);
  app.post('/refresh-session', {}, refreshSessionController);
  app.post('/reset-password', resetPasswordController);

  done();
};
