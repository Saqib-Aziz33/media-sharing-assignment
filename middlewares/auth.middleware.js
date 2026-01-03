const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");
const { config } = require("../config/config");

const isAuthenticated = async (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer")) {
    res
      .status(401)
      .json({ success: false, message: "unauthorized, token not found" });
    return;
  }
  // get the token
  const token = auth.split(" ")[1];
  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "unauthorized, token not found" });
    return;
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    // find the user
    const user = await User.findById(decoded._id).lean();
    if (!user) {
      res.status(404).json({ success: false, message: "user not found" });
      return;
    }

    req.user = { ...user, passwordHash: undefined };
    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "authentication failed, maybe token is expired",
    });
  }
};

/**
 *
 * @param {string[]} roles, provide allowed roles from ADMIN_ROLES
 */
const allowedRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "insufficient permission" });
    }
    next();
  };

module.exports = { isAuthenticated, allowedRoles };
