import { StatusCodes } from 'http-status-codes';

class ForbiddenActionError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'ForbiddenActionError';
    this.message = message;
    this.code = code || StatusCodes.FORBIDDEN;
    this.pointer = pointer;
    this.data = data;
  }
}

export default ForbiddenActionError;
