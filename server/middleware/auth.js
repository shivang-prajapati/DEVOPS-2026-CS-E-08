const { verifyToken } = require('../config/auth');
const { sendError } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authentication token is required.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token.');
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'User is not authenticated.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to access this resource.');
    }

    return next();
  };
};

module.exports = {
  authenticate,
  authorize
};
