const {
  activateController,
  forgotPasswordController,
  loginController,
  resetPasswordController,
} = require('../controllers/account');

module.exports = (app, _, done) => {
  app.post('/activate', activateController);
  app.post('/forgot-password', forgotPasswordController);
  app.post('/login', loginController);
  app.post('/reset-password', resetPasswordController);

  done();
};
