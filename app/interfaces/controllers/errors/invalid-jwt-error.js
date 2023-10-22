import { StatusCodes } from 'http-status-codes';

class InvalidJWTError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'InvalidJWTError';
    this.message = message;
    this.code = code || StatusCodes.UNAUTHORIZED;
    this.pointer = pointer;
    this.data = data;
  }
}

export default InvalidJWTError;
