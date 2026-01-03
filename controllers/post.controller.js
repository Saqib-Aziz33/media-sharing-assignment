const { Post } = require("../models/post.model");
const { Comment } = require("../models/comment.model");
const { asyncHandler } = require("../lib/helper");
const fs = require("fs");
const path = require("path");

exports.create = asyncHandler(async (req, res) => {
  const { title, caption, location, peoplePresent } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Image is required" });
  }

  const media = {
    url: `/www/uploads/${req.file.filename}`,
    fileType: req.file.mimetype,
  };

  const post = await Post.create({
    creator: req.user._id,
    media,
    title,
    caption,
    location,
    peoplePresent: peoplePresent ? (Array.isArray(peoplePresent) ? peoplePresent : [peoplePresent]) : [],
  });

  res.status(201).json(post);
});

exports.getAll = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const pipeline = [];

  if (search) {
    pipeline.push({
      $match: {
        title: { $regex: search, $options: "i" },
      },
    });
  }

  pipeline.push({
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "post",
      as: "comments",
    },
  });

  pipeline.push({
    $sort: { createdAt: -1 },
  });

  const posts = await Post.aggregate(pipeline);

  res.status(200).json({ posts });
});

exports.getById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId).populate("creator", "name email");

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const comments = await Comment.find({ post: postId }).populate("user", "name");

  const postData = post.toObject();
  postData.comments = comments;

  res.status(200).json({ post: postData });
});

exports.update = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { title, caption, location, peoplePresent } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (title) post.title = title;
  if (caption) post.caption = caption;
  if (location) post.location = location;
  if (peoplePresent) {
    post.peoplePresent = Array.isArray(peoplePresent) ? peoplePresent : [peoplePresent];
  }

  if (req.file) {
    // Delete old image
    const oldPath = path.join(__dirname, "..", "public/www/uploads", post.media.url);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error("Failed to delete old image:", err);
      }
    }

    post.media = {
      url: `/www/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
    };
  }

  await post.save();
  res.status(200).json(post);
});

exports.delete = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Delete image
  const filePath = path.join(__dirname, "..", "public/www/uploads", post.media.url);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  }

  // Delete comments
  await Comment.deleteMany({ post: postId });

  await post.deleteOne();

  res.status(200).json({ message: "Post deleted successfully" });
});

exports.addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const comment = await Comment.create({
    post: postId,
    user: req.user._id,
    text,
  });

  res.status(201).json(comment);
});
