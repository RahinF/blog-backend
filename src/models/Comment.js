import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    postId: { 
      type: String,
      required: true 
    },
    parentId: {
      type: String,
    },
    author: {
      type: String,
      required: true,
      maxLength: [30, "Cannot be more than 30 characters"],
    },
    text: {
      type: String,
      required: true,
      maxLength: [250, "Cannot be more than 250 characters"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Comment", commentSchema);
