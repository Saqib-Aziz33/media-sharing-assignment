const winston = require("winston");

const { combine, timestamp, printf, errors } = winston.format;

// Custom format to log complete error messages and stack traces
const textFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), errors({ stack: true }), textFormat),
  defaultMeta: { service: "default" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(timestamp(), errors({ stack: true }), textFormat),
    })
  );
}

module.exports = logger;
