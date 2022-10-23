import express from "express";
import {
  getAllComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentsController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router
  .route("/")
  .get(getAllComments)
  .post(createComment)
  .put(verifyJWT, updateComment)
  .delete(verifyJWT, deleteComment);

export default router;
