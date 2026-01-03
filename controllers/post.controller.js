const { asyncHandler } = require("../lib/helper");

exports.create = asyncHandler(async (req, res) => {
  // Logic to create a post
});

exports.getAll = asyncHandler(async (req, res) => {
  // Logic to get all posts
  return res.status(200).json({ message: "Get all posts", user: req.user });
});

exports.getById = asyncHandler(async (req, res) => {
  // Logic to get a post by ID
});

exports.update = asyncHandler(async (req, res) => {
  // Logic to update a post
});

exports.delete = asyncHandler(async (req, res) => {
  // Logic to delete a post
});

exports.addComment = asyncHandler(async (req, res) => {
  // Logic to add a comment to a post
});
