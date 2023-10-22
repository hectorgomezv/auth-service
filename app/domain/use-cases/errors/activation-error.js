import { StatusCodes } from 'http-status-codes';

class ActivationError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'ActivationError';
    this.message = message;
    this.code = code || StatusCodes.NOT_ACCEPTABLE;
    this.pointer = pointer;
    this.data = data;
  }
}

export default ActivationError;
