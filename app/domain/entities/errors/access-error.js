import { StatusCodes } from 'http-status-codes';

class AccessError extends Error {
  constructor(message, code, pointer, data) {
    super();
    this.name = 'AccessError';
    this.message = message;
    this.code = code || StatusCodes.FORBIDDEN;
    this.pointer = pointer;
    this.data = data;
  }
}

export default AccessError;
