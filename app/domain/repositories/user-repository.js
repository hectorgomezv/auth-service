const { db } = require('../../infrastructure/database/mongodb');

const COLLECTION_NAME = 'users';
const users = () => db().collection(COLLECTION_NAME);

class UserRepository {
  static async findByEmail(email) {
    return users().findOne({ email });
  }

  static async findByActivationCode(activationCode) {
    return users().findOne({ activationCode });
  }

  static async create(user) {
    const { ops: [item] } = await users().insertOne(user);

    return item;
  }

  static async addSession(userId, session) {
    return 'todo';
  }

  static async activate(userId, password) {
    return 'todo';
  }
}

module.exports = UserRepository;
