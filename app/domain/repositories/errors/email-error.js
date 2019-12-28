const { INTERNAL_SERVER_ERROR } = require('http-status-codes');

class EmailError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'EmailError';
    this.message = message;
    this.code = code || INTERNAL_SERVER_ERROR;
    this.pointer = pointer;
    this.data = data;
  }
}

module.exports = EmailError;
