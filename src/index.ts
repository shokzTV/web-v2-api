import "./tasks";

import config from "./config";
import express from "express";
import { green } from "chalk";
import http from "http";
import passport from "passport";

async function startServer() {
  const app = express();
  await require("./loaders").default({ app, passport });

  const server = http.createServer(app);
  server.listen(config.port, () => {
    console.log(green(`API started on: ${config.port}`));
  });
}

startServer();
