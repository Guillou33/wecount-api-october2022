import "module-alias/register";
import "reflect-metadata";
import OldEfTagsModification from "@root/service/dataIngest/temp/OldEfTagsModification";
import SqlConnection from "@root/service/core/database/SqlConnection";

const start = async () => {
  await SqlConnection.setInstance();

  const ingestor = new OldEfTagsModification('files/temp/ef_tags_modifications.csv');
  
  await ingestor.read();
  await ingestor.ingest();
}

start();
