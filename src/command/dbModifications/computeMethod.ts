import "module-alias/register";
import "reflect-metadata";
import Modificator from "@root/service/dataIngest/computeMethod/Modificator";
import SqlConnection from "@root/service/core/database/SqlConnection";

const start = async () => {
  await SqlConnection.setInstance();

  const ingestor = new Modificator('files/temp/dbModifications/computeMethod.csv');
  
  await ingestor.read();
  await ingestor.ingest();
}

start();
