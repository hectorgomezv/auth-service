const {
  loginController,
  activateController,
} = require('../controllers/account');

module.exports = (app, opts, done) => {
  app.post('/login', loginController);
  app.post('/activate', activateController);

  done();
};
