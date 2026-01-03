const { asyncHandler } = require("../lib/helper");
const { User } = require("../models/user.model");
const { matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { config } = require("../config/config");

exports.registerUser = asyncHandler(async (req, res) => {
  // find if user already exists
  const exists = await User.exists({ email: req.body.email });
  if (exists) {
    return res
      .status(400)
      .json({ message: "User with this email already exists" });
  }

  // hash the password
  const passwordHash = await bcrypt.hash(req.body.password, 10);

  // create the user
  const user = new User({
    ...matchedData(req),
    passwordHash,
  });
  console.log(user)
  await user.save();
  return res.status(201).json({ message: "User registered successfully" });
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).lean();
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ _id: user._id }, config.jwtSecret, {
    expiresIn: "7d",
  });

  res.setHeader("Authorization", `Bearer ${token}`);

  return res.status(200).json({
    message: "User logged in successfully",
    token,
    user: { ...user, passwordHash: undefined },
  });
});
