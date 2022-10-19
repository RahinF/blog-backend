import expressAsyncHandler from "express-async-handler";
import User from "../models/User.js";
import bcrypt from "bcrypt";

/**
 *  @desciption get all users
 *  @route GET /
 *  @access PUBLIC
 **/
export const getAllUsers = expressAsyncHandler(async (request, response) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return response.status(400).json({ message: "No users found" });
  }

  response.json(users);
});

/**
 *  @desciption create a user
 *  @route POST /
 *  @access PUBLIC
 **/
export const createUser = expressAsyncHandler(async (request, response) => {
  const { username, email, password } = request.body;

  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!username || !email || !password) {
    return response.status(400).json({ message: "All fields are required." });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return response
      .status(400)
      .json({
        message:
          "Password must contain 8 characters including at least 1 letter and 1 number.",
      });
  }

  const duplicate = await User.findOne({ email }).lean().exec();

  if (duplicate) {
    response.status(409).json({ message: "Email is already in use." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ username, email, password: hashedPassword });

  if (user) {
    response.status(201).json({ message: `New user ${username} created.` });
  } else {
    response.status(400).json({ message: "Invalid user data received." });
  }
});

/**
 *  @desciption update a user
 *  @route PUT /
 *  @access PRIVATE
 **/
export const updateUser = expressAsyncHandler(async (request, response) => {});
