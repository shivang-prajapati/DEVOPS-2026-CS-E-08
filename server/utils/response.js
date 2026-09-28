const sendSuccess = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, statusCode, message, details = null) => {
  const payload = {
    success: false,
    message
  };

  if (details) {
    payload.error = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess, sendError };
