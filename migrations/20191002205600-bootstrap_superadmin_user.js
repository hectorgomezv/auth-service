require('dotenv').config();
const bcrypt = require('bcrypt');

const USERS_COLLECTION = 'users';

const { SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } = process.env;

const up = async (db) =>
  db.collection(USERS_COLLECTION).insertOne({
    username: 'superAdmin',
    email: SUPERADMIN_EMAIL,
    password: await bcrypt.hash(SUPERADMIN_PASSWORD, 10),
    role: 'superAdmin',
    fullName: 'Super admin',
    active: true,
    sessions: [],
  });

const down = async (db) =>
  db.collection(USERS_COLLECTION).deleteOne({
    email: SUPERADMIN_EMAIL,
  });

export default {
  up,
  down,
};
