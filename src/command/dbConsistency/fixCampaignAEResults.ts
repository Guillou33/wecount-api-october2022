import "module-alias/register";
import "reflect-metadata";
import { getManager } from "typeorm";
import SqlConnection from "@root/service/core/database/SqlConnection";

const THRESHOLD = 0.1;

const start = async () => {
  await SqlConnection.setInstance();
  const em = getManager();

  if (process.argv.length < 3) {
    console.error('You need to specify campaign id');
    process.kill(process.pid, 'SIGTERM')
  }

  const campaignId = parseInt(process.argv[2]);
  const updatePromises: Promise<void>[] = [];

  const baseQueryResult = await em.query(
    `SELECT company.id as company_id, company.name as company_name, p.id as perimeter_id, c.id as campaign_id, ae.id, ae.created_at, ae.updated_at, ae.value, ae.value2, ef.value as ef_value, ef.name as ef_name, 
    ae.result_tco2,
    CASE WHEN ae.value2 IS NULL THEN ae.value * ef.value ELSE ae.value * ae.value2 * ef.value END as expected_result
          FROM activity_entry ae
            INNER JOIN activity a ON a.id = ae.activity_id
            INNER JOIN campaign c ON c.id = a.campaign_id
            INNER JOIN perimeter p ON p.id = c.perimeter_id
            INNER JOIN company ON company.id = p.company_id
            INNER JOIN compute_method cm ON cm.id = ae.compute_method_id
            INNER JOIN emission_factor ef ON ef.id = ae.emission_factor_id
            WHERE ae.compute_method_type = 'STANDARD' AND cm.special_compute_mode IS NULL
            AND (ae.value2 IS NOT NULL
            AND (ABS(ae.result_tco2 - (ae.value * ae.value2 * ef.value)) / (ae.value * ae.value2 * ef.value)) > ${THRESHOLD}
            OR ae.value2 IS NULL
            AND (ABS(ae.result_tco2 - (ae.value * ef.value)) / (ae.value * ef.value)) > ${THRESHOLD})
            AND ae.ignore_result_consistency_validation = false
            AND c.id = ${campaignId}
           ORDER BY company.id, p.id, c.id
    `
  )

  baseQueryResult.forEach((line: any, index: number) => {
    updatePromises.push(em.query(
      `UPDATE activity_entry SET result_tco2 = ${line['expected_result']}, emission_factor_value = ${line['ef_value']}
      WHERE id = ${line['id']}`
    ))
  });

  const accountingDepreciationQueryResult = await em.query(
    `SELECT company.id as company_id, company.name as company_name, p.id as perimeter_id, c.id as campaign_id, ae.id, ae.created_at, ae.updated_at, ae.value, ae.value2, ef.value as ef_value, ef.name as ef_name, 
    ae.result_tco2,
    CASE WHEN (ae.value2 IS NULL OR ae.value2 = 0) THEN 0 ELSE ef.value * ae.value / ae.value2 END as expected_result
          FROM activity_entry ae
            INNER JOIN activity a ON a.id = ae.activity_id
            INNER JOIN campaign c ON c.id = a.campaign_id
            INNER JOIN perimeter p ON p.id = c.perimeter_id
            INNER JOIN company ON company.id = p.company_id
            INNER JOIN compute_method cm ON cm.id = ae.compute_method_id
            INNER JOIN emission_factor ef ON ef.id = ae.emission_factor_id
            WHERE ae.compute_method_type = 'STANDARD' AND cm.special_compute_mode = 'ACCOUNTING_DEPRECIATION'
            AND (
              (
                (ae.value2 IS NULL OR ae.value2 = 0) 
                AND ae.result_tco2 != 0
              )
              OR (
                ABS(ae.result_tco2 - (ef.value * ae.value / ae.value2)) / (ef.value * ae.value / ae.value2) > 0.1
              )
            )
            AND ae.ignore_result_consistency_validation = false
            AND c.id = ${campaignId}
           ORDER BY company.id, p.id, c.id
    `
  )

  accountingDepreciationQueryResult.forEach((line: any, index: number) => {
    updatePromises.push(em.query(
      `UPDATE activity_entry SET result_tco2 = ${line['expected_result']}, emission_factor_value = ${line['ef_value']}
      WHERE id = ${line['id']}`
    ))
  });

  await Promise.all(updatePromises);

  console.log(`Campaing #${campaignId} updated : ${updatePromises.length} entries updated`);
  
  (await SqlConnection.getInstance()).close();

  process.exit();
  setTimeout(() => {
    // kill if problem, to avoid memory leak
    process.kill(process.pid, 'SIGTERM')
  }, 3000);
}

start();
