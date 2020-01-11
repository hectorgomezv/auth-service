const {
  activateController,
  forgotPasswordController,
  loginController,
} = require('../controllers/account');

module.exports = (app, _, done) => {
  app.post('/activate', activateController);
  app.post('/forgot-password', forgotPasswordController);
  app.post('/login', loginController);

  done();
};
