import "module-alias/register";
import "reflect-metadata";
import SqlConnection from "@deep/database/SqlConnection";
import Ingestor from "@root/service/dataIngest/translation/Modificator";

const start = async () => {
  const connection = await SqlConnection.setInstance();
  // await connection.synchronize();

  const ingestor = new Ingestor('files/temp/translation/translation.csv');
  
  await ingestor.read();
  await ingestor.ingest();
}

start();
