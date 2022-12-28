import express from "express";
import { login, logout, refresh, register } from "../controllers/authController.js";

const router = express.Router();

router
  .route("/")
  .post(login);

router
  .route("/register")
  .post(register);


router
  .route("/refresh")
  .get(refresh);

router
  .route("/logout")
  .post(logout);

export default router;
