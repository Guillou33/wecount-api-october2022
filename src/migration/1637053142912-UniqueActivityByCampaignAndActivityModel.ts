import {MigrationInterface, QueryRunner} from "typeorm";

export class UniqueActivityByCampaignAndActivityModel1637053142912 implements MigrationInterface {
    name = 'UniqueActivityByCampaignAndActivityModel1637053142912'

    public async up(queryRunner: QueryRunner): Promise<void> {
      const activitiesToReplace = await queryRunner.query(`
        SELECT a.id, a_first.id as first_activity_id, a.result_tco2 FROM  activity a
        INNER JOIN (SELECT MIN(a2.id) as id, a2.activity_model_id, a2.campaign_id FROM activity a2
          GROUP BY a2.activity_model_id, a2.campaign_id
        ) as a_first ON a_first.activity_model_id = a.activity_model_id AND a_first.campaign_id = a.campaign_id
        WHERE a.id != a_first.id
      `);

      const resultTCo2ByFinalActivity: {[activityToKeepId: number]: number} = {};
      for (let i = 0; i < activitiesToReplace.length; i++) {
        const activityToReplace = activitiesToReplace[i];

        if (!resultTCo2ByFinalActivity[activityToReplace['first_activity_id']]) {
          resultTCo2ByFinalActivity[activityToReplace['first_activity_id']] = 0;
        }
        resultTCo2ByFinalActivity[activityToReplace['first_activity_id']] += activityToReplace['result_tco2'];

        await queryRunner.query(`
          UPDATE activity_entry ae
          SET ae.activity_id = ${activityToReplace['first_activity_id']}
          WHERE ae.activity_id = ${activityToReplace['id']}`);

        await queryRunner.query(`
          DELETE FROM activity a
          WHERE a.id = ${activityToReplace['id']}`);
      }

      for (let i = 0; i < activitiesToReplace.length; i++) {
        const activityToReplace = activitiesToReplace[i];

        const activitiesTreated: number[] = []
        if (activitiesTreated.indexOf(activityToReplace['first_activity_id']) === -1) {
          if (typeof activityToReplace['first_activity_id'] === 'number') {
            console.log('result : ', resultTCo2ByFinalActivity[activityToReplace['first_activity_id']]);
            await queryRunner.query(`
              UPDATE activity a
              SET a.result_tco2 = (a.result_tco2 + ${resultTCo2ByFinalActivity[activityToReplace['first_activity_id']]})
              WHERE a.id = ${activityToReplace['first_activity_id']}`);
          }
          
        }
      }
      

      for (let i = 0; i < activitiesToReplace.length; i++) {
        const activityToReplace = activitiesToReplace[i];
        await queryRunner.query(`
          DELETE FROM activity a
          WHERE a.id = ${activityToReplace['id']}`);
      }

      await queryRunner.query("CREATE UNIQUE INDEX `UniqueByCampaignAndActivityModel` ON `activity` (`activity_model_id`, `campaign_id`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
