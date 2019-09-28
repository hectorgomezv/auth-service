const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} = require('http-status-codes');

const adaptValidationError = ({ details: [validationError] }) => ({
  status: BAD_REQUEST,
  title: 'ValidationError',
  detail: validationError.message,
  data: validationError,
});

const adaptError = ({
  code = INTERNAL_SERVER_ERROR,
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

module.exports = ({ isJoi, ...err }) => (isJoi ? adaptValidationError(err) : adaptError(err));
