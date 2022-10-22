import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  updatePost,
} from "../controllers/postsController.js";

const router = express.Router();

router.route("/")
  .get(getAllPosts)
  .post(createPost)
  .put(updatePost)
  .delete(deletePost);

  router.route('/:postId')
    .get(getPost);

export default router;
