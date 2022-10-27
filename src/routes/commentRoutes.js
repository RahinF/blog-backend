import express from "express";
import {
  getAllComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentsController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.get('/:postId', getAllComments);

router
  .route("/")
  .post(createComment)
  .put(verifyJWT, updateComment)
  .delete(verifyJWT, deleteComment);

export default router;
