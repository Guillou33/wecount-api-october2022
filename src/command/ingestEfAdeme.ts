import "module-alias/register";
import "reflect-metadata";
import SqlConnection from "@deep/database/SqlConnection";
import Ingestor from "@root/service/dataIngest/emissionFactor/Ingestor";
import { DbName } from "@root/entity/enum/EmissionFactorEnums";

const start = async () => {
  const connection = await SqlConnection.setInstance();
  // await connection.synchronize();

  const ingestor = new Ingestor('files/temp/fes_ademe.csv', DbName.ADEME);
  
  await ingestor.read();
  await ingestor.ingest();
}

start();
