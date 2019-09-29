const { createUserController } = require('../controllers/user');

module.exports = (app, opts, done) => {
  app.post('/', createUserController);

  done();
};
