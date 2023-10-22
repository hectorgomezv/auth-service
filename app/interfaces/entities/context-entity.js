import AuthEntity from './auth-entity.js';

/**
 * Adds a context object to the request object.
 * @param {Object} req request object.
 * @param {Object} res response object.
 * @param {Function} next next function in the pipeline.
 */
const buildContext = (req, res, next) => {
  try {
    const { headers } = req;
    req.context = {
      auth: AuthEntity.processAuth(headers),
    };
  } catch (err) {
    return next(err);
  }

  return next();
};

export default {
  buildContext,
};
