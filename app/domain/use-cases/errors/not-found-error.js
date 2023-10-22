import { StatusCodes } from 'http-status-codes';

class NotFoundError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'NotFoundError';
    this.message = message;
    this.code = code || StatusCodes.NOT_FOUND;
    this.pointer = pointer;
    this.data = data;
  }
}

export default NotFoundError;
