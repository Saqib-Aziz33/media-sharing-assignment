const { body, validationResult } = require("express-validator");
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

module.exports = {
  validate,
};
