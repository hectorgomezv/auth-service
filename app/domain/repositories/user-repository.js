import { ObjectId } from 'mongodb';
import { db } from '../../infrastructure/database/mongodb.js';

const { REFRESH_TOKEN_EXPIRATION } = process.env;

const COLLECTION_NAME = 'users';
const users = () => db().collection(COLLECTION_NAME);

export default class UserRepository {
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

  static async findByResetPasswordCode(resetPasswordCode) {
    return users().findOne({ resetPasswordCode });
  }

  static async findByIdAndFilterSessionByAccessToken(id, accessToken) {
    const [user] = await users()
      .aggregate([
        { $match: { _id: ObjectId(id) } },
        {
          $project: {
            email: 1,
            role: 1,
            active: 1,
            sessions: {
              $filter: {
                input: '$sessions',
                as: 'item',
                cond: {
                  $eq: ['$$item.accessToken', accessToken],
                },
              },
            },
          },
        },
      ])
      .toArray();

    return user;
  }

  static async create(user) {
    await users().insertOne(user);
  }

  static async addSession(userId, session) {
    return users().findOneAndUpdate(
      { _id: userId },
      { $push: { sessions: session } },
      { returnOriginal: false },
    );
  }

  static async clearExpiredSessions() {
    const dateLimit = new Date(
      Date.now() - Number(REFRESH_TOKEN_EXPIRATION) * 1000,
    );

    return users().updateMany(
      {},
      {
        $pull: {
          sessions: {
            createdAt: {
              $lt: dateLimit,
            },
          },
        },
      },
      { multi: true },
    );
  }

  static async generateResetPasswordCode(
    userId,
    resetPasswordCode,
    expiration,
  ) {
    return users().findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          resetPasswordCode,
          resetPasswordExpiration: expiration,
        },
      },
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

  /**
   * Sets the new password for the user pointed by the id.
   * @param {String} id id of the user.
   * @param {String} password hashed password.
   * @returns {User} modified user.
   */
  static async applyResetPassword(id, password) {
    const { value } = await users().findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { password } },
      { returnOriginal: false },
    );

    return value;
  }
}
