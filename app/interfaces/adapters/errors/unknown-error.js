const { INTERNAL_SERVER_ERROR } = require('http-status-codes');

class UnknownError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'UnknownError';
    this.message = message || 'No message specified';
    this.code = code || INTERNAL_SERVER_ERROR;
    this.pointer = pointer;
    this.data = data;
  }
}

module.exports = UnknownError;
