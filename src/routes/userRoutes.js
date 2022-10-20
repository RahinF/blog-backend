import express from "express";
import {
  createUser,
  getAllUsers,
  updateUser,
} from "../controllers/usersController.js";

const router = express.Router();

router.route("/")
  .get(getAllUsers)
  .post(createUser)
  .put(updateUser);

export default router;
