const { AccountController } = require('../controllers');

module.exports = (app, opts, done) => {
  app.get('/', AccountController.login);

  done();
};
