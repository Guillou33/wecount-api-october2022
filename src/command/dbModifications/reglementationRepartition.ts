import "module-alias/register";
import "reflect-metadata";
import Modificator from "@root/service/dataIngest/computeMethodReglementationRepartition/Modificator";
import SqlConnection from "@root/service/core/database/SqlConnection";

const start = async () => {
  await SqlConnection.setInstance();

  const ingestor = new Modificator(
    "files/temp/dbModifications/computeMethodReglementationRepartition.csv"
  );

  await ingestor.read();
  await ingestor.ingest();
};

start();
