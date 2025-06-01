import cors from "cors";
import express from "express";
import path from "path";
import "./bot/telegram";
import { errorHandler, unknownEndpoint } from "./middlewares/error";
import { logMiddleware } from "./middlewares/logger";
import { routes } from "./routes";

export const app = express();

app.use(cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use(logMiddleware); // Log all requests to the console

app.use(
  express.static(path.join(__dirname, "..", "public"), {
    setHeaders: (res, filePath) => {
      console.log(filePath);
      if (filePath.endsWith(".br")) {
        res.setHeader("Content-Encoding", "br");

        if (filePath.endsWith(".js.br")) {
          res.setHeader("Content-Type", "application/javascript");
        }
        if (filePath.endsWith(".wasm.br")) {
          res.setHeader("Content-Type", "application/wasm");
        }
        if (filePath.endsWith(".data.br")) {
          res.setHeader("Content-Type", "application/octet-stream");
        }
      }
    },
  })
);

app.use("/health", (req, res) => {
  res.send("OK");
});

app.use("/api/v1", routes);

app.use(unknownEndpoint); // Handle unknown endpoints
app.use(errorHandler); // Handle errors
