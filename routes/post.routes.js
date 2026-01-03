const { Router } = require("express");
const { allowedRoles } = require("../middlewares/auth.middleware");
const controller = require("../controllers/post.controller");
const { upload } = require("../lib/multer");
const {
  validate,
  postValidationRules,
  postUpdateValidationRules,
  commentValidationRules,
  postParamValidationRules,
} = require("../middlewares/validations.middleware");

const router = Router();

router
  .route("/")
  .get(controller.getAll)
  .post(
    allowedRoles("creator"),
    upload.single("image"),
    postValidationRules,
    validate,
    controller.create
  );

router
  .route("/:postId")
  .get(postParamValidationRules, validate, controller.getById)
  .put(
    allowedRoles("creator"),
    upload.single("image"),
    postParamValidationRules,
    postUpdateValidationRules,
    validate,
    controller.update
  )
  .delete(
    allowedRoles("creator"),
    postParamValidationRules,
    validate,
    controller.delete
  );

router
  .route("/:postId/comments")
  .post(
    postParamValidationRules,
    commentValidationRules,
    validate,
    controller.addComment
  );

module.exports = router;
