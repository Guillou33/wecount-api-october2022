import "module-alias/register";
import "reflect-metadata";
import SqlConnection from "@deep/database/SqlConnection";
import EfMappingIngestor from "@root/service/dataIngest/efTags/EfMappingIngestor";

const start = async () => {
  const connection = await SqlConnection.setInstance();
  // await connection.synchronize();

  const ingestor = new EfMappingIngestor('files/temp/tags/label1.csv');
  
  await ingestor.read();
  await ingestor.ingest();
  
}

start();
