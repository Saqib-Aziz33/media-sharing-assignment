const { body, param, validationResult } = require("express-validator");
const { Types } = require("mongoose");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

const userValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("name must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("name can only contain letters, numbers, and underscores"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["creator", "consumer"])
    .withMessage("Role must be either 'creator' or 'consumer'"),
];

const emailPasswordRules = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  validate,
  userValidationRules,
  emailPasswordRules,
  postValidationRules: [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("caption").optional().trim(),
    body("location").optional().trim(),
  ],
  postUpdateValidationRules: [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("caption").optional().trim(),
    body("location").optional().trim(),
  ],
  commentValidationRules: [
    body("text").trim().notEmpty().withMessage("Comment text is required"),
  ],
  postParamValidationRules: [
    param("postId").isMongoId().withMessage("Invalid Post ID"),
  ],
};
