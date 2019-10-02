const { db } = require('../../infrastructure/database/mongodb');

const COLLECTION = 'users';

class UserRepository {
  static async create(user) {
    return db.collection(COLLECTION).insertOne(user);
  }

  static async findByEmail(email) {
    const found = await db.collection(COLLECTION).findOne({ email });

    return found;
  }

  static async addSession(userId, session) {
    return 'todo';
  }
}

module.exports = UserRepository;
