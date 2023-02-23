import "module-alias/register";
import "reflect-metadata";
import SqlConnection from "@deep/database/SqlConnection";
import EfTagLabel2Ingestor from "@root/service/dataIngest/efTags/EfTagLabel2Ingestor";

const start = async () => {
  const connection = await SqlConnection.setInstance();
  // await connection.synchronize();

  const ingestor = new EfTagLabel2Ingestor('files/temp/tags/label2.csv');
  
  await ingestor.read();
  await ingestor.ingest();
  
}

start();
