require('dotenv').config();

const {
  webServer,
  database,
} = require('./infrastructure');


(async () => {
  try {
    webServer.init();
    database.connect();
  } catch (err) {
    console.error(err);
  }
})();
