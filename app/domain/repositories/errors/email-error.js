import { StatusCodes } from 'http-status-codes';

class EmailError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'EmailError';
    this.message = message;
    this.code = code || StatusCodes.INTERNAL_SERVER_ERROR;
    this.pointer = pointer;
    this.data = data;
  }
}

export default EmailError;
