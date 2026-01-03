require("dotenv").config();

const express = require("express");
const path = require("path");
const initRoutes = require("./routes");
const { connectDB } = require("./lib/db");
const { config } = require("./config/config");
const cors = require("cors");

const app = express();

connectDB();

// middlewares
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV !== "production") {
  app.use(require("morgan")("dev"));
}

initRoutes(app);

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
