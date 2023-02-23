import "module-alias/register";
import "reflect-metadata";
import SqlConnection from "@deep/database/SqlConnection";
import EfTagLabel1Ingestor from "@root/service/dataIngest/efTags/EfTagLabel1Ingestor";

const start = async () => {
  const connection = await SqlConnection.setInstance();
  // await connection.synchronize();

  const ingestor = new EfTagLabel1Ingestor('files/temp/tags/label1.csv');
  
  await ingestor.read();
  await ingestor.ingest();
  
}

start();
