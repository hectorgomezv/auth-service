const { FORBIDDEN } = require('http-status-codes');

class ForbiddenActionError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'ForbiddenActionError';
    this.message = message;
    this.code = code || FORBIDDEN;
    this.pointer = pointer;
    this.data = data;
  }
}

module.exports = ForbiddenActionError;
