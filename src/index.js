import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger, logEvents } from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import corsOptions from "./config/corsOptions.js";
import connectDB from "./config/dbConnect.js";
import mongoose from "mongoose";
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3500;

connectDB();

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (request, response) => {
  response.send("Hello World!");
});

app.use('/uploads', express.static('src/uploads'))
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/upload', uploadRoutes);

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to mongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on("error", (error) => {
  console.log(error);
  logEvents(
    `${error.no}: ${error.code}\t${error.syscall}\t${error.hostname}`,
    "mongoDBErrorLog.log"
  );
});
