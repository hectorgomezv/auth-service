const { db } = require('../../infrastructure/database/mongodb');

const COLLECTION = 'users';

class UserRepository {
  static async findByEmail(email) {
    const found = await db().collection(COLLECTION).findOne({ email });

    return found;
  }

  static async create(user) {
    const { ops: [item] } = await db().collection(COLLECTION).insertOne(user);

    return item;
  }

  static async addSession(userId, session) {
    return 'todo';
  }
}

module.exports = UserRepository;
