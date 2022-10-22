import expressAsyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";
import mongoose from "mongoose";
import User from "../models/User.js";

/**
 *  @desciption get all comment of a post
 *  @route GET /
 *  @access PUBLIC
 **/
export const getAllComments = expressAsyncHandler(async (request, response) => {
  const { postId } = request.body;

  if (!mongoose.isValidObjectId(postId)) {
    return response
      .status(400)
      .json({ message: "A valid 'postId' is required." });
  }

  const comments = await Comment.find({ postId }).lean();

  if (!comments?.length) {
    return response.status(400).json({ message: "No comments found." });
  }

  const commentsWithAuthor = await Promise.all(
    comments.map(async (comment) => {
      if (mongoose.isValidObjectId(comment.author)) {
        const user = await User.findOne({ author: comment.author })
          .select("-password")
          .lean()
          .exec();

        return { ...comment, author: user };
      } else {
        return comment;
      }
    })
  );

  response.json(commentsWithAuthor);
});

/**
 *  @desciption create a comment
 *  @route POST /
 *  @access PUBLIC
 **/
export const createComment = expressAsyncHandler(async (request, response) => {
  const { postId, parentId, author, text } = request.body;

  if (!mongoose.isValidObjectId(postId)) {
    return response
      .status(400)
      .json({ message: "A valid 'postId' is required." });
  }

  if (!author || !text) {
    return response
      .status(400)
      .json({ message: "Author and Text are required." });
  }

  const comment = await Comment.create({ postId, parentId, author, text });

  if (comment) {
    return response.status(201).json({ message: "New comment created." });
  } else {
    return response
      .status(400)
      .json({ message: "Invalid comment data received." });
  }
});

/**
 *  @desciption update a comment
 *  @route PUT /
 *  @access PRIVATE
 **/
export const updateComment = expressAsyncHandler(async (request, response) => {
  const { commentId, text } = request.body;

  if (!mongoose.isValidObjectId(commentId)) {
    return response
      .status(400)
      .json({ message: "A valid 'commentId' is required." });
  }

  if (!text) {
    return response.status(400).json({ message: "Text is required." });
  }

  const comment = await Comment.findById(commentId).exec();

  if (!comment) {
    return response.status(400).json({ message: "Comment not found." });
  }

  comment.text = text;

  const updatedComment = await comment.save();

  response
    .status(200)
    .json(`Comment with ID of ${updatedComment._id} updated.`);
});

/**
 *  @desciption delete a comment
 *  @route DELETE /
 *  @access PRIVATE
 **/
export const deleteComment = expressAsyncHandler(async (request, response) => {
  const { commentId } = request.body;

  if (!mongoose.isValidObjectId(commentId)) {
    return response
      .status(400)
      .json({ message: "A valid 'commentId' is required." });
  }

  const comment = await Comment.findById(commentId).exec();

  if (!comment) {
    return response.status(400).json({ message: "Comment not found." });
  }

  //   find children
  let childrenArray = [];

  const findChildren = async (commentId) => {
    const children = await Comment.find({ parentId: commentId }).exec();

    const childrenIds = await Promise.all(
      children.map(async (child) => {
        if (child.parentId) {
          await findChildren(child._id);
        }
        return child;
      })
    );

    childrenArray.push(childrenIds);
  };

  await findChildren(comment._id);

  await Promise.all(
    childrenArray.flat().map(async (child) => await child.deleteOne())
  );

  const result = await comment.deleteOne();

  response.status(200).json(`Comment of ID ${result._id} and replies deleted.`);
});
