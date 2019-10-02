const { client: db } = require('../../infrastructure/database/mongodb');

class UserRepository {
  static async create(user) {
    return db.
  }

  static async findByEmail(email) {
    return 'todo';
  }

  static async addSession(userId, session) {
    return 'todo';
  }
}

module.exports = UserRepository;
