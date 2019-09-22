class AccountController {
  static async login(request, reply) {
    reply.type('application/json').code(200);
    return { hello: 'login' };
  }
}

module.exports = AccountController;
