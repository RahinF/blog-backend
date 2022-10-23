import express from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import {
  createUser,
  getAllUsers,
  updateUser,
} from "../controllers/usersController.js";

const router = express.Router();

router
  .route("/")
  .get(getAllUsers)
  .post(createUser)
  .put(verifyJWT, updateUser);

export default router;


 