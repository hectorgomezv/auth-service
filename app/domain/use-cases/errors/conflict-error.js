const { CONFLICT } = require('http-status-codes');

class ConflictError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'ConflictError';
    this.message = message;
    this.code = code || CONFLICT;
    this.pointer = pointer;
    this.data = data;
  }
}

module.exports = ConflictError;
