import "module-alias/register";
import "reflect-metadata";
import { getManager } from "typeorm";
import SqlConnection from "@root/service/core/database/SqlConnection";

const start = async () => {
  await SqlConnection.setInstance();
  const em = getManager();

  const queryResult = await em.query(
    `SELECT ae.id, ae.updated_at, ae.value, ae.value2, ae.result_tco2, ef.value as ef_value, ef.name as ef_name, c.id as campaign_id
      FROM activity_entry ae
        INNER JOIN activity a ON a.id = ae.activity_id
        INNER JOIN campaign c ON c.id = a.campaign_id
        INNER JOIN compute_method cm ON cm.id = ae.compute_method_id
        INNER JOIN emission_factor ef ON ef.id = ae.emission_factor_id
        WHERE ae.compute_method_type = 'STANDARD' AND cm.special_compute_mode IS NULL
        AND ae.ignore_result_consistency_validation = false
    `
  )

  queryResult.forEach((line: any, index: number) => {
    const expectedResult = line['value'] * (line['value2'] ?? 1) * line['ef_value'];
    if (expectedResult !== line['result_tco2']) {
      if ((Math.abs(line['result_tco2'] - expectedResult) / expectedResult) > 0.1) {
        console.log("\n");
        console.log(`Campaign # ${line['campaign_id']}`);
        console.log(`EF name : ${line['ef_name']}`);
        console.log(`AE # ${line['id']} corrupted : expected ${expectedResult}, got ${line['result_tco2']}`);
      }
    }
  });

  (await SqlConnection.getInstance()).close();
}

start();
