import expressAsyncHandler from "express-async-handler";
import { existsSync, unlink } from "fs";

export const uploadFile = expressAsyncHandler(async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ message: "A file must be uploaded." });
  }

  const filename = request.file.filename;
  response.status(200).json({ filename });
});

export const deleteFile = expressAsyncHandler(async (request, response) => {
  const { filename } = request.body;

  if (!filename) {
    return response.status(400).json({ message: "A filename is required." });
  }

  const path = `src/uploads/${filename}`;

  if (!existsSync(path)) {
    return response.status(400).json({ message: "File was not found." });
  }

  unlink(path, (error) => {
    if (error) {
      return response.status(500).json(`File could not be deleted.`);
    }

    response.status(200).json(`${filename} was deleted.`);
  });
});
