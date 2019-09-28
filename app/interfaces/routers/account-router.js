const { loginController } = require('../controllers/account');

module.exports = (app, opts, done) => {
  app.post('/login', loginController);

  done();
};
