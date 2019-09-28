const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} = require('http-status-codes');

module.exports = ({
  isJoi,
  code,
  name,
  pointer,
  message,
  data,
}) => {
  if (isJoi) {
    return {
      status: BAD_REQUEST,
      title: name,
      source: pointer,
      detail: message,
      data,
    };
  }

  return {
    status: code || INTERNAL_SERVER_ERROR,
    title: name,
    source: pointer,
    detail: message,
    data,
  };
};
