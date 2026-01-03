const { isAuthenticated } = require("../middlewares/auth.middleware");
const { notFoundHandler, errorHandler } = require("../services/error.service");

function initRoutes(app) {
  app.get("/", (_, res) => {
    res.json({ message: "Welcome to the Media Sharing API" });
  });

  app.use("/api/v1/auth", require("./auth.routes"));
  // app.use("/users", isAuthenticated, require("./user.routes"));
  app.use("/api/v1/posts", isAuthenticated, require("./post.routes"));

  app.use("/*", notFoundHandler);
  app.use(errorHandler);
}

module.exports = initRoutes;
