import express from "express";
import {
  getAllComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentsController.js";

const router = express.Router();

router
  .route("/")
  .get(getAllComments)
  .post(createComment)
  .put(updateComment)
  .delete(deleteComment);

export default router;
