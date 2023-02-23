import "module-alias/register";
import "reflect-metadata";
import SqlConnection from "@deep/database/SqlConnection";
import Ingestor from "@root/service/dataIngest/computeMethod/Ingestor";

const start = async () => {
  const connection = await SqlConnection.setInstance();
  // await connection.synchronize();

  const ingestor = new Ingestor('files/temp/compute_methods.csv');
  
  await ingestor.read();
  await ingestor.ingest();
  
}

start();
