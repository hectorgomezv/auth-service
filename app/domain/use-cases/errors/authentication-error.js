import { StatusCodes } from 'http-status-codes';

class AuthenticationError extends Error {
  constructor(message, pointer, code, data) {
    super();
    this.name = 'AuthenticationError';
    this.message = message;
    this.code = code || StatusCodes.UNAUTHORIZED;
    this.pointer = pointer;
    this.data = data;
  }
}

export default AuthenticationError;
