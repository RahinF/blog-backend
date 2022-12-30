import expressAsyncHandler from "express-async-handler";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { PASSWORD_REGEX } from "../constants/regex.js";
import mongoose from "mongoose";

/**
 *  @desciption get all users
 *  @route GET /
 *  @access PUBLIC
 **/
export const getAllUsers = expressAsyncHandler(async (request, response) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return response.status(200).json(users);
  }

  response.json(users);
});

/**
 *  @desciption update a user
 *  @route PUT /
 *  @access PRIVATE
 **/
export const updateUser = expressAsyncHandler(async (request, response) => {
  const { username, email, password } = request.body;
  const userId = request.user;

  if (!mongoose.isValidObjectId(userId)) {
    return response
      .status(400)
      .json({ message: "A valid 'userId' is required." });
  }

  if (!username && !email && !password) {
    return response
      .status(400)
      .json({ message: "Username, Email, or Password is required." });
  }

  const user = await User.findById(userId).exec();

  if (!user) {
    return response.status(404).json({ message: "User not found." });
  }

  if (username) {
    user.username = username;
  }

  if (email) {
    const duplicate = await User.findOne({ email }).lean().exec();
    if (duplicate) {
      return response.status(409).json({ message: "Email is already in use." });
    }

    user.email = email;
  }

  if (password) {
    if (!PASSWORD_REGEX.test(password)) {
      return response.status(400).json({
        message:
          "Password must contain 8 characters including at least 1 letter and 1 number.",
      });
    }
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  response.json({ message: `${updatedUser.username} updated.` });
});
