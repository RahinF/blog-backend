import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

/**
 *  @desciption login
 *  @route POST /
 *  @access PUBLIC
 **/
export const login = expressAsyncHandler(async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email }).exec();
  if (!user)
    return response
      .status(401)
      .json({ message: "The email or password you have entered is invalid." });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return response
      .status(401)
      .json({ message: "The email or password you have entered is invalid." });

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "10m",
    }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  user.refreshToken = refreshToken;
  await user.save();

  response.cookie("jwt", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "none",
    secure: true,
  });

  response.status(200).json({ accessToken });
});

/**
 *  @desciption register
 *  @route POST /
 *  @access PUBLIC
 **/
export const register = expressAsyncHandler(async (request, response) => {
  const { username, email, password } = request.body;

  if (!username || !email || !password) {
    return response
      .status(400)
      .json({ message: "All fields are required." });
  }

  const duplicate = await User.findOne({ email }).exec();
  if (duplicate)
    return response
      .status(409)
      .json({ message: "The email address is already in use." });


  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });


  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "10m",
    }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  user.refreshToken = refreshToken;
  await user.save();

  response.cookie("jwt", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "none",
    secure: true,
  });

  response.status(200).json({ accessToken });
});

/**
 *  @desciption refresh
 *  @route GET / refresh
 *  @access PUBLIC
 **/
export const refresh = expressAsyncHandler(async (request, response) => {
  const cookies = request.cookies;

  if (!cookies?.jwt) {
    return response.status(401).json({ message: "Unauthorized." });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (error, decoded) => {
      if (error) {
        return response.status(403).json({ message: "Forbidden." });
      }

      const user = await User.findById(decoded.userId).exec();

      if (!user) {
        return response.status(401).json({ message: "Unauthorized." });
      }

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );

      response.status(200).json({ accessToken });
    }
  );
});

/**
 *  @desciption logout
 *  @route POST / logout
 *  @access PRIVATE
 **/
export const logout = expressAsyncHandler(async (request, response) => {
  const cookies = request.cookies;

  if (!cookies?.jwt) {
    return response.sendStatus(204);
  }

  const user = await User.findOne({ refreshToken: cookies.jwt });

  if (user) {
    user.refreshToken = "";
    await user.save();
  }

  response.clearCookie("jwt");
  response.sendStatus(204);
});
