import { StatusCodes } from 'http-status-codes';

class ConflictError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'ConflictError';
    this.message = message;
    this.code = code || StatusCodes.CONFLICT;
    this.pointer = pointer;
    this.data = data;
  }
}

export default ConflictError;
