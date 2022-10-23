import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  updatePost,
} from "../controllers/postsController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router
  .route("/")
  .get(getAllPosts)
  .post(verifyJWT, createPost)
  .put(verifyJWT, updatePost)
  .delete(verifyJWT, deletePost);

  router
  .route('/:postId')
  .get(getPost);

export default router;
