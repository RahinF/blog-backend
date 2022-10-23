import express from "express";
import { deleteFile, uploadFile } from "../controllers/uploadController.js";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import { existsSync, mkdirSync } from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    const path = "src/uploads/";

    if (!existsSync(path)) {
      mkdirSync(path);
    }

    callback(null, path);
  },
  filename: function (request, file, callback) {
    callback(null, uuid() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).single("file");

router
  .route("/")
  .post(upload, uploadFile)
  .delete(deleteFile);

export default router;
