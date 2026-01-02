const { notFoundHandler, errorHandler } = require("../services/error.service");

function initRoutes(app) {
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Media Sharing API" });
  });
  app.use("/*", notFoundHandler);
  app.use(errorHandler);
}

module.exports = initRoutes;
