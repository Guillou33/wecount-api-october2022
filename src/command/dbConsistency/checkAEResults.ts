import "module-alias/register";
import "reflect-metadata";
import { getManager } from "typeorm";
import SqlConnection from "@root/service/core/database/SqlConnection";
import { logAdmin } from "@root/service/core/log/logAdmin";

const THRESHOLD = 0.1;

const start = async () => {
  await SqlConnection.setInstance();
  const em = getManager();

  let contentHtml = `
    <p>
      Des entrées d'activité ont un total incohérent (par rapport à leurs input, et à leur facteur d'émission) : 
      <br>
      <br>
  `;

  const baseQueryResult = await em.query(
    `SELECT company.id as company_id, company.name as company_name, p.id as perimeter_id, c.id as campaign_id, ae.id, aer.reference_id, ae.created_at, ae.updated_at, ae.value, ae.value2, ef.value as ef_value, ef.id as ef_id, 
    ae.result_tco2,
    CASE WHEN ae.value2 IS NULL THEN ae.value * ef.value ELSE ae.value * ae.value2 * ef.value END as expected_result
          FROM activity_entry ae
            INNER JOIN activity_entry_reference aer ON aer.id = ae.activity_entry_reference_id
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
            AND ae.soft_deleted_at IS NULL
            AND c.soft_deleted_at IS NULL
           ORDER BY company.id, p.id, c.id
    `
  )

  baseQueryResult.forEach((line: any, index: number) => {
    contentHtml += `
      <strong>${line['company_name']} (#${line['company_id']}) erreur : ${Math.round(100 * (line['result_tco2'] - line['expected_result']) / line['expected_result'])}%</strong>
      <ul>
        <li>
          Campagne #${line['campaign_id']} (périmètre #${line['perimeter_id']})
        </li>
        <li>
          AE #${line['id']} (Référence <i>${line['reference_id']}</i>), création : ${line['created_at']}, update : ${line['updated_at']}
        </li>
        <li>
          Total attendu : ${line['expected_result']} kCO2, total constaté : ${line['result_tco2']}
        </li>
        <li>
          Valeur 1 : ${line['value']}, valeur 2 : ${line['value2']}, EF value : ${line['ef_value']}
        </li>
        <li>
          EF : #${line['ef_id']}
        </li>
      </ul>
      <br />
    `;
  });

  const accountingDepreciationQueryResult = await em.query(
    `SELECT company.id as company_id, company.name as company_name, p.id as perimeter_id, c.id as campaign_id, ae.id, aer.reference_id, ae.created_at, ae.updated_at, ae.value, ae.value2, ef.value as ef_value, ef.id as ef_id, 
    ae.result_tco2,
    CASE WHEN (ae.value2 IS NULL OR ae.value2 = 0) THEN 0 ELSE ef.value * ae.value / ae.value2 END as expected_result
          FROM activity_entry ae
            INNER JOIN activity_entry_reference aer ON aer.id = ae.activity_entry_reference_id
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
            AND ae.soft_deleted_at IS NULL
            AND c.soft_deleted_at IS NULL
           ORDER BY company.id, p.id, c.id
    `
  )

  accountingDepreciationQueryResult.forEach((line: any, index: number) => {
    contentHtml += `
      <strong>${line['company_name']} (#${line['company_id']}) erreur : ${Math.round(100 * (line['result_tco2'] - line['expected_result']) / line['expected_result'])}%</strong>
      <ul>
        <li>
          Campagne #${line['campaign_id']} (périmètre #${line['perimeter_id']})
        </li>
        <li>
          AE #${line['id']} (Référence <i>${line['reference_id']}</i>), création : ${line['created_at']}, update : ${line['updated_at']}
        </li>
        <li>
          Type de calcul : amortissement
        </li>
        <li>
          Total attendu : ${line['expected_result']} kCO2, total constaté : ${line['result_tco2']}
        </li>
        <li>
          Valeur 1 : ${line['value']}, valeur 2 : ${line['value2']}, EF value : ${line['ef_value']}
        </li>
        <li>
          EF : ${line['ef_id']}
        </li>
      </ul>
      <br/>
    `;
  });

  if (!baseQueryResult.length && !accountingDepreciationQueryResult.length) {
    return;
  }

  contentHtml += `</ul></p>`;

  await logAdmin('Totaux incohérents', contentHtml);

  (await SqlConnection.getInstance()).close();

  process.exit();
  setTimeout(() => {
    // kill if problem, to avoid memory leak
    process.kill(process.pid, 'SIGTERM')
  }, 3000);
}

start();
