const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      url: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
        required: true,
      },
    },
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
    },
    location: {
      type: String,
    },
    peoplePresent: {
      type: [String],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

module.exports = {
  Post,
};
