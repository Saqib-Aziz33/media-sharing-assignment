const mongoose = require("mongoose");
const logger = require("./logger");
const { config } = require("../config/config");

async function connectDB() {
  try {
    const conn = await mongoose.connect(config.dbUrl);
    logger.info(`DB connected to ${conn.connection.host}`);
  } catch (e) {
    logger.error(`DB connection ERR ${e.message}`);
  }
}

module.exports = {
  connectDB,
};
