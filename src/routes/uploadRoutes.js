import express from "express";
import { deleteFile, uploadFile } from "../controllers/uploadController.js";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import { existsSync, mkdirSync } from "fs";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    const path = "src/uploads/";

    if (!existsSync(path)) {
      mkdirSync(path);
    }

    callback(null, path);
  },
  filename: (request, file, callback) => {
    callback(null, uuid() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).single("file");

router.use(verifyJWT);

router
  .route("/")
  .post(upload, uploadFile)
  .delete(deleteFile);

export default router;
