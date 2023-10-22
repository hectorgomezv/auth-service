import { StatusCodes } from 'http-status-codes';
import UnknownError from './errors/unknown-error.js';

const adaptValidationError = ({ details: [validationError] }) => ({
  status: StatusCodes.BAD_REQUEST,
  title: 'ValidationError',
  detail: validationError.message,
  data: validationError,
});

const adaptError = ({
  code = StatusCodes.INTERNAL_SERVER_ERROR,
  name,
  pointer,
  message,
  data,
}) => ({
  status: code,
  title: name,
  source: pointer,
  detail: message,
  data,
});

export default (err) => {
  if (err.isJoi) return adaptValidationError(err);
  if (!err.name) return adaptError(new UnknownError());
  return adaptError(err);
};
