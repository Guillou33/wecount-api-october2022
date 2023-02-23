import "module-alias/register";
import "reflect-metadata";
import SqlConnection from "@deep/database/SqlConnection";
import { Connection } from "typeorm";
import { userManager } from "@manager/index";
import { timeout } from '@root/service/utils/timeout'
import fs from "fs";
import { insertFixtures } from "./fixtures/initialFixtures";

let connection: Connection;

const run = async () => {
  connection = await SqlConnection.getInstance();
  if (!connection.isConnected) {
    await connection.connect();
  }
  await connection.synchronize(true);
  
  await userManager.createNew(
    {
      email: "thomas@weepulse.fr",
      password: "azertyuiop1A&",
      profile: { 
        firstName: "Thomas", 
        lastName: "Dournet" 
      },
      company: { 
        name: "WeePulse" 
      },
      perimeter: null,
    },
    true
  );

  await insertFixtures(connection);

  await connection.close();
};

export default run;
