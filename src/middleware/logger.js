import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), `dd-MM-yyyy\th:mm:ss a`);
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  try {
    if (!fs.existsSync(path.join(__dirname, "../..", "logs"))) {
      await fs.promises.mkdir(path.join(__dirname, "../..", "logs"));
    }
    await fs.promises.appendFile(
      path.join(__dirname, "../..", "logs", logFileName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

const logger = (request, response, next) => {
  logEvents(
    `${request.method}\t${request.url}\t${request.headers.origin}`,
    "requestLog.log"
  );

  console.log(`${request.method} ${request.path}`);

  next();
};

export { logger, logEvents };
