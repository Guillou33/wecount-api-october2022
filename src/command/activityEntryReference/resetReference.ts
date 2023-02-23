import "module-alias/register";
import "reflect-metadata";
import { getManager } from "typeorm";
import SqlConnection from "@root/service/core/database/SqlConnection";

const start = async () => {
  await SqlConnection.setInstance();
  const em = getManager();

  const queryResult = await em.query(
    `SELECT aer.id, MAX(ac.number_code) as acnc, MAX(am.number_code) as amnc, aer.raw_reference_id FROM activity_entry ae
      INNER JOIN activity_entry_reference aer ON aer.id = ae.activity_entry_reference_id
      INNER JOIN activity a ON ae.activity_id = a.id
      INNER JOIN activity_model am ON am.id = a.activity_model_id
      INNER JOIN activity_category ac ON ac.id = am.activity_category_id
      GROUP BY aer.id
    `
  )

  const updatePromises: Promise<any>[] = [];
  queryResult.forEach((line: any) => {
    const rawReference = line.raw_reference_id;
    updatePromises.push(em.query(`UPDATE activity_entry_reference SET reference_id = '${line.acnc}-${line.amnc}-${rawReference}' WHERE activity_entry_reference.id = ${line.id}`));
  });

  Promise.all(updatePromises).then(() => {
    console.log('END');
  })
}

start();
