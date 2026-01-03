const { Router } = require("express");
const { allowedRoles } = require("../middlewares/auth.middleware");
const controller = require("../controllers/post.controller");

const router = Router();

router.route("/").get(controller.getAll).post(allowedRoles("creator"));

router
  .route("/:postId")
  .get()
  .put(allowedRoles("creator"))
  .delete(allowedRoles("creator"));

router.route("/:postId/comment").post();

module.exports = router;
