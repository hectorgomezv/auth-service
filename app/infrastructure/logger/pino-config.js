const { NODE_ENV } = process.env;

const config = (NODE_ENV !== 'production') ? {
  prettyPrint: true,
} : {};

module.exports = config;
