const { Router } = require("express");
const { allowedRoles } = require("../middlewares/auth.middleware");
const controller = require("../controllers/post.controller");

const router = Router();

router
  .route("/")
  .get(controller.getAll)
  .post(allowedRoles("creator"), controller.create);

router
  .route("/:postId")
  .get(controller.getById)
  .put(allowedRoles("creator"), controller.update)
  .delete(allowedRoles("creator"), controller.delete);

router.route("/:postId/comment").post();

module.exports = router;
