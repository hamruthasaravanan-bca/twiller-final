import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    postText: {
      type: String,
      required: true,
      trim: true
    },

    postImage: {
      type: String,
      default: ""
    },

    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    displayName: {
      type: String,
      trim: true
    },

    username: {
      type: String,
      trim: true
    },

    avatar: {
      type: String,
      default: ""
    },

    likedBy: {
      type: [String], // OK for now
      default: []
    },

    retweetedBy: {
      type: [String],
      default: []
    },

    likesCount: {
      type: Number,
      default: 0
    },

    retweetsCount: {
      type: Number,
      default: 0
    },

    commentsCount: {
      type: Number,
      default: 0
    },

    replies: [
      {
        userId: String,
        userName: String,
        avatar: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Post", postSchema);