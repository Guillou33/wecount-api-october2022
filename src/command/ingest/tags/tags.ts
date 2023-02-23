import "module-alias/register";
import "reflect-metadata";
import SqlConnection from "@deep/database/SqlConnection";
import EfTagIngestor from "@root/service/dataIngest/efTags/EfTagIngestor";

const start = async () => {
  const connection = await SqlConnection.setInstance();
  // await connection.synchronize();

  const ingestor = new EfTagIngestor('files/temp/tags/tags.csv');
  
  await ingestor.read();
  await ingestor.ingest();
  
}

start();
