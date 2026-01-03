const { Router } = require("express");
const controller = require("../controllers/auth.controller");
const {
  userValidationRules,
  validate,
  emailPasswordRules,
} = require("../middlewares/validations.middleware");

const router = Router();

router.post(
  "/register",
  userValidationRules,
  validate,
  controller.registerUser
);

router.post("/login", emailPasswordRules, validate, controller.loginUser);

module.exports = router;
