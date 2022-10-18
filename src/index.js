import express from "express";
import { logger } from "./middleware/logger.js";

const app = express();
const PORT = process.env.PORT || 3500;

app.use(logger);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
