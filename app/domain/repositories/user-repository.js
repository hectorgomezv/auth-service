const { ObjectId } = require('mongodb');
const { db } = require('../../infrastructure/database/mongodb');

const COLLECTION_NAME = 'users';
const users = () => db().collection(COLLECTION_NAME);

class UserRepository {
  static async find() {
    return users().find({}).toArray();
  }

  static async findById(id) {
    return users().findOne({ _id: new ObjectId(id) });
  }

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
        $unset: {
          activationCode: true,
        },
      },
      { returnOriginal: false },
    );

    return value;
  }

  /**
   * Sets the activation state of the user pointed by the id.
   * @param {String} id id of the user to modify.
   * @param {Boolean} active true if the user is set to active.
   */
  static async setActivationState(id, active) {
    const { value } = await users().findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { active } },
      { returnOriginal: false },
    );

    return value;
  }
}

module.exports = UserRepository;
