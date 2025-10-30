const USERS_COLLECTION = 'users';

const up = async (db) =>
  db.createCollection(USERS_COLLECTION, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: [
          'email',
          'password',
          'role',
          'fullName',
          'active',
          'sessions',
        ],
        properties: {
          email: {
            bsonType: 'string',
            pattern: '^.+@.+$',
          },
          password: { bsonType: 'string' },
          avatarUrl: { bsonType: 'string' },
          fullName: { bsonType: 'string' },
          role: { bsonType: 'string' },
          active: { bsonType: 'bool' },
          activationCode: { bsonType: 'string' },
          activationCodeExpiration: { bsonType: 'date' },
          resetPasswordCode: { bsonType: 'string' },
          resetPasswordExpiration: { bsonType: 'date' },
          sessions: {
            bsonType: ['array'],
            items: {
              bsonType: 'object',
              required: ['accessToken', 'refreshToken'],
              properties: {
                accessToken: {
                  bsonType: 'string',
                },
                refreshToken: {
                  bsonType: 'string',
                },
              },
            },
          },
        },
      },
    },
  });

const down = async (db) => db.collection(USERS_COLLECTION).drop();

module.exports = {
  up,
  down,
};
