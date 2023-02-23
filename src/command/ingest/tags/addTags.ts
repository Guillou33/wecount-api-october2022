import "module-alias/register";
import "reflect-metadata";
import SqlConnection from "@deep/database/SqlConnection";
import EfAddTags from "@root/service/dataIngest/efTags/EfAddTags";

const start = async () => {
  const connection = await SqlConnection.setInstance();
  // await connection.synchronize();

  const ingestor = new EfAddTags('files/temp/tags/tags.csv');
  
  await ingestor.read();
  await ingestor.ingest();
  
}

start();
