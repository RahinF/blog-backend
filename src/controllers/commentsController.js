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
  const { postId } = request.params;

  if (!mongoose.isValidObjectId(postId)) {
    return response
      .status(400)
      .json({ message: "A valid 'postId' is required." });
  }

  const comments = await Comment.find({
    postId,
    parentId: { $exists: false },
  }).lean();

  if (!comments?.length) {
    return response.status(200).json(comments);
  }



  const findUser = async ({ author }) => {
    if (mongoose.isValidObjectId(author)) {
      const user = await User.findById(author)
        .select("-password -refreshToken -isAdmin")
        .lean()
        .exec();



      return user;
    } else {
      return author;
    }
  };

  const findChildren = async (comment) => {
    const childrenFound = await Comment.find({ parentId: comment._id })
      .lean()
      .exec();

    const nestedChildren = await Promise.all(
      childrenFound.map(async (child) => {
        child.author = await findUser(child);
        child.children = await findChildren(child);
        return child;
      })
    );

    return nestedChildren.length ? nestedChildren : undefined;
  };

  await Promise.all(
    comments.map(async (comment) => {
      comment.author = await findUser(comment);
      comment.children = await findChildren(comment);
      return comment;
    })
  );

  response.json(comments);
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
    return response.status(404).json({ message: "Comment not found." });
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
    return response.status(404).json({ message: "Comment not found." });
  }

  //   find children
  let commentChildren = [];

  const findChildren = async (commentId) => {
    const children = await Comment.find({ parentId: commentId }).exec();

    const childrenFound = await Promise.all(
      children.map(async (child) => {
        await findChildren(child._id);
        return child;
      })
    );

    commentChildren.push(childrenFound);
  };

  await findChildren(comment._id);

  const commentDeleted = await comment.deleteOne();

  if (commentDeleted) {
    await Promise.all(
      commentChildren.flat().map(async (child) => await child.deleteOne())
    );
  }

  response
    .status(200)
    .json(`Comment of ID ${commentDeleted._id} and replies deleted.`);
});
