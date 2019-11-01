const { NOT_FOUND } = require('http-status-codes');

class NotFoundError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'NotFoundError';
    this.message = message;
    this.code = code || NOT_FOUND;
    this.pointer = pointer;
    this.data = data;
  }
}

module.exports = NotFoundError;
