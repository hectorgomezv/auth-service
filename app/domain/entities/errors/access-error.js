const { FORBIDDEN } = require('http-status-codes');

class AccessError extends Error {
  constructor(message, code, pointer, data) {
    super();
    this.name = 'AccessError';
    this.message = message;
    this.code = code || FORBIDDEN;
    this.pointer = pointer;
    this.data = data;
  }
}

module.exports = AccessError;
