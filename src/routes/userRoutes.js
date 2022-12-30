import express from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import {
  getAllUsers,
  updateUser,
} from "../controllers/usersController.js";

const router = express.Router();

router
  .route("/")
  .get(getAllUsers)
  .put(verifyJWT, updateUser);

export default router;


 