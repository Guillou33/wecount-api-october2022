import "module-alias/register";
import "reflect-metadata";
import SqlConnection from "@deep/database/SqlConnection";
import { Connection } from "typeorm";
import { userManager } from "@manager/index";

let connection: Connection;

beforeAll(async () => {
  connection = await SqlConnection.getInstance();
  if (!connection.isConnected) {
    await connection.connect();
  }
  await connection.synchronize();
});
beforeEach(async () => {
  // await connection.dropDatabase();
  
});
afterAll(async () => {
  // await connection.dropDatabase();
  // await connection.synchronize(true);
  await connection.close();
});

