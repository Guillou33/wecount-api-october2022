import "module-alias/register";
import "reflect-metadata";
import Modificator from "@root/service/dataIngest/activity/Modificator";
import SqlConnection from "@root/service/core/database/SqlConnection";

const start = async () => {
  await SqlConnection.setInstance();

  const ingestor = new Modificator('files/temp/dbModifications/activity.csv');
  
  await ingestor.read();
  await ingestor.ingest();
}

start();
