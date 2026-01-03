const { notFoundHandler, errorHandler } = require("../services/error.service");

function initRoutes(app) {
  app.get("/", (_, res) => {
    res.json({ message: "Welcome to the Media Sharing API" });
  });

  app.use("/auth", require("./auth.routes"));
  app.use("/users", require("./user.routes"));
  app.use("/posts", require("./post.routes"));

  app.use("/*", notFoundHandler);
  app.use(errorHandler);
}

module.exports = initRoutes;
