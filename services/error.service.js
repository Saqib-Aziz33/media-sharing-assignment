const logger = require("../lib/logger");

const notFoundHandler = (req, res) => {
  return res.status(404).json({ success: false, message: "route not found" });
};

const errorHandler = (err, req, res, next) => {
  logger.error(`500 server error, ${err.message}`);
  logger.error(err.stack);
  res.status(500).json({ success: false, message: "something went wrong" });
};

class AppError extends Error {}

module.exports = {
  notFoundHandler,
  errorHandler,
  AppError,
};
