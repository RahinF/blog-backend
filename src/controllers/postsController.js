import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { existsSync, unlink } from "fs";

/**
 *  @desciption get all posts
 *  @route GET /
 *  @access PUBLIC
 **/
export const getAllPosts = expressAsyncHandler(async (request, response) => {
  const { category } = request.query;

  let posts;
  if (category) {
    posts = await Post.find({
      category: [category],
    })
      .sort({ createdAt: -1 })
      .lean();
  } else {
    posts = await Post.find().sort({ createdAt: -1 }).lean();
  }

  const postsWithAuthor = await Promise.all(
    posts.map(async (post) => {
      const author = await User.findById(post.author)
        .select("-email -password -refreshToken -isAdmin -__v")
        .lean();
      post.author = author;
      return post;
    })
  );

  response.json(postsWithAuthor);
});

/**
 *  @desciption get a post
 *  @route GET /
 *  @access PUBLIC
 **/
export const getPost = expressAsyncHandler(async (request, response) => {
  const { postId } = request.params;
  const post = await Post.findById(postId).lean();

  if (!post) {
    return response.status(404).json({ message: "No post found." });
  }

  const author = await User.findById(post.author)
    .select("-email -password -refreshToken -isAdmin -__v")
    .lean();
  post.author = author;

  response.json(post);
});

/**
 *  @desciption create a post
 *  @route POST /
 *  @access PRIVATE
 **/
export const createPost = expressAsyncHandler(async (request, response) => {
  const { title, text, image, category } = request.body;

  if (!title || !text || !category) {
    return response
      .status(400)
      .json({ message: "Title, Text and Category are required." });
  }

  const author = request.user;

  const post = await Post.create({ author, title, text, image, category });

  if (post) {
    return response.status(201).json(post._id);
  } else {
    return response
      .status(400)
      .json({ message: "Invalid post data received." });
  }
});

/**
 *  @desciption update a post
 *  @route PUT /
 *  @access PRIVATE
 **/
export const updatePost = expressAsyncHandler(async (request, response) => {
  const { postId, title, text, image, category } = request.body;

  if (!mongoose.isValidObjectId(postId)) {
    return response
      .status(400)
      .json({ message: "A valid 'postId' is required." });
  }

  if (!title && !text && !category) {
    return response
      .status(400)
      .json({ message: "Title, Text, or Category is required." });
  }

  const post = await Post.findById(postId).exec();

  if (!post) {
    return response.status(404).json({ message: "Post not found." });
  }

  if (title) {
    post.title = title;
  }

  if (text) {
    post.text = text;
  }

  if (category) {
    post.category = category;
  }

  if (image) {
    post.image = image;
  }

  const updatedPost = await post.save();

  response.json(updatedPost._id);
});

/**
 *  @desciption delete post
 *  @route DELETE /
 *  @access PRIVATE
 **/
export const deletePost = expressAsyncHandler(async (request, response) => {
  const { postId } = request.body;

  if (!mongoose.isValidObjectId(postId)) {
    return response
      .status(400)
      .json({ message: "A valid 'postId' is required." });
  }

  const post = await Post.findById(postId).exec();

  if (!post) {
    return response.status(404).json({ message: "Post not found." });
  }

  const postDeleted = await post.deleteOne();

  if (postDeleted) {
    if (postDeleted.image) {
      const path = `src/uploads/${postDeleted.image}`;

      if (existsSync(path)) {
        unlink(path, () => {});
      }
    }
    await Comment.deleteMany({ postId: post._id });
  }

  response.json(
    `Post '${postDeleted.title}' with ID ${postDeleted._id} deleted.`
  );
});
