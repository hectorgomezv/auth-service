const { UNAUTHORIZED } = require('http-status-codes');

class InvalidJWTError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'InvalidJWTError';
    this.message = message;
    this.code = code || UNAUTHORIZED;
    this.pointer = pointer;
    this.data = data;
  }
}

module.exports = InvalidJWTError;
