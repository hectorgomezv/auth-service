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
    return users().findOneAndUpdate(
      { _id: userId },
      { $push: { sessions: session } },
      { returnOriginal: false },
    );
  }

  static async activate(userId, password) {
    const { value } = await users().findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          active: true,
          password,
        },
      },
      { returnOriginal: false },
    );

    return value;
  }
}

module.exports = UserRepository;
