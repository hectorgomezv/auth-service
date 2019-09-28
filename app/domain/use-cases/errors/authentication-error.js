const { UNAUTHORIZED } = require('http-status-codes');

class AuthenticationError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'AuthenticationError';
    this.message = message;
    this.code = code || UNAUTHORIZED;
    this.pointer = pointer;
    this.data = data;
  }
}

module.exports = AuthenticationError;
