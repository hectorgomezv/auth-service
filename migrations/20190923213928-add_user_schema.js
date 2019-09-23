const USERS_COLLECTION = 'users';

const up = async (db) => {
  db.createCollection(USERS_COLLECTION, {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['username', 'email', 'sessions'],
        properties: {
          username: {
            bsonType: 'string',
          },
          email: {
            bsonType: 'string',
            pattern: '^.+@.+$',
          },
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
};

const down = async (db) => {
  db.collection(USERS_COLLECTION).drop();
};

module.exports = {
  up,
  down,
};