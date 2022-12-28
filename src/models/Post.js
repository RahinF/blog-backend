import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      maxLength: [100, "Cannot be more than 100 characters"],
    },
    text: {
      type: String,
      required: true,
      maxLength: [5000, "Cannot be more than 5000 characters"],
    },
    image: {
      type: String,
    },
    category: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Post", postSchema);
