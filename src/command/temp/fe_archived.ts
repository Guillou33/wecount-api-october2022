import "module-alias/register";
import "reflect-metadata";
import EmissionFactorArchived from "@root/service/dataIngest/temp/EmissionFactorArchived";
import SqlConnection from "@root/service/core/database/SqlConnection";
import { DbName } from "@root/entity/enum/EmissionFactorEnums";

const start = async () => {
  await SqlConnection.setInstance();

  const ingestor = new EmissionFactorArchived('files/temp/ADEME_archived.csv', DbName.ADEME);
  
  await ingestor.read();
  await ingestor.ingest();
}

start();
