const { NOT_ACCEPTABLE } = require('http-status-codes');

class ActivationError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'ActivationError';
    this.message = message;
    this.code = code || NOT_ACCEPTABLE;
    this.pointer = pointer;
    this.data = data;
  }
}

module.exports = ActivationError;
