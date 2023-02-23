import "module-alias/register";
import "reflect-metadata";
import "stackify-node-apm";
import "newrelic";
import { app } from "@root/app";
import SqlConnection from "@deep/database/SqlConnection";
import { Connection } from "typeorm";
import config from "config";
import logger from "./service/core/log/logger";

const port: number = config.get('port');

SqlConnection.setInstance().then((connection: Connection): void => {
  app.listen(port, () => {
    logger.info(`App started : listening on port ${port}`);
  });
});
