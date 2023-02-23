import { SCOPE } from "@root/entity/enum/Scope";
import {MigrationInterface, QueryRunner} from "typeorm";

export class resetResultTco2inCampaign1652962153927 implements MigrationInterface {
    name = 'resetResultTco2inCampaign1652962153927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const campaigns = await queryRunner.query(`
            SELECT c.id FROM campaign c
        `);

        for(let i = 0; i < campaigns.length; i++){
            const campaignId = campaigns[i]['id'];

            const rawResult = await queryRunner.query(
                `SELECT 
                ac.scope as scope,
                SUM(ae.result_tco2) as tco2,
                SUM(
                  (CASE 
                    WHEN ef.id IS NULL 
                    THEN ae.uncertainty
                    ELSE (1 - ((1 - ae.uncertainty) * (1 - ef.uncertainty / 100)))
                    END
                  ) * ae.result_tco2
                ) as raw_uncertainty
                FROM campaign c
                INNER JOIN activity a ON a.campaign_id = c.id
                INNER JOIN activity_entry ae ON ae.activity_id = a.id
                LEFT JOIN emission_factor ef ON ef.id = ae.emission_factor_id
                INNER JOIN activity_model am ON a.activity_model_id = am.id
                INNER JOIN activity_category ac ON am.activity_category_id = ac.id
                WHERE c.id = ?
                AND a.status != 'ARCHIVED'
                AND a.soft_deleted_at IS NULL
                AND ae.soft_deleted_at IS NULL
                AND c.soft_deleted_at IS NULL
                GROUP BY ac.scope`,
                [campaignId]
            );

            const rawResultForTrajectory = await queryRunner.query(
                `SELECT 
                ac.scope as scope,
                SUM(ae.result_tco2) as tco2,
                SUM(
                  (CASE 
                    WHEN ef.id IS NULL 
                    THEN ae.uncertainty
                    ELSE (1 - ((1 - ae.uncertainty) * (1 - ef.uncertainty / 100)))
                    END
                  ) * ae.result_tco2
                ) as raw_uncertainty
                FROM campaign c
                INNER JOIN activity a ON a.campaign_id = c.id
                INNER JOIN activity_entry ae ON ae.activity_id = a.id
                LEFT JOIN emission_factor ef ON ef.id = ae.emission_factor_id
                INNER JOIN activity_model am ON a.activity_model_id = am.id
                INNER JOIN activity_category ac ON am.activity_category_id = ac.id
                WHERE c.id = ?
                AND a.status != 'ARCHIVED'
                AND a.soft_deleted_at IS NULL
                AND ae.soft_deleted_at IS NULL
                AND ae.is_excluded_from_trajectory = 0
                AND c.soft_deleted_at IS NULL
                GROUP BY ac.scope`,
                [campaignId]
            );
        
            const totals: {
                scope: SCOPE;
                tco2: number;
                raw_uncertainty: number;
            }[] = rawResult;

            const getScopeMetrics = (scope: SCOPE) => {
                const resultTco2 = totals.find(row => row.scope === scope)?.tco2 ?? 0;
                return {
                    resultTco2,
                    uncertainty: !resultTco2
                    ? 0
                    : (totals.find(row => row.scope === scope)?.raw_uncertainty ?? 0) /
                        resultTco2,
                };
            };

            const upstream = getScopeMetrics(SCOPE.UPSTREAM);
            const core = getScopeMetrics(SCOPE.CORE);
            const downstream = getScopeMetrics(SCOPE.DOWNSTREAM);


            const totalsForTrajectory: {
                scope: SCOPE;
                tco2: number;
                raw_uncertainty: number;
            }[] = rawResultForTrajectory;

            const getScopeMetricsForTrajectory = (scope: SCOPE) => {
                const resultTco2 = totalsForTrajectory.find(row => row.scope === scope)?.tco2 ?? 0;
                return {
                    resultTco2,
                    uncertainty: !resultTco2
                    ? 0
                    : (totalsForTrajectory.find(row => row.scope === scope)?.raw_uncertainty ?? 0) /
                        resultTco2,
                };
            };

            const upstreamTrajectory = getScopeMetricsForTrajectory(SCOPE.UPSTREAM);
            const coreTrajectory = getScopeMetricsForTrajectory(SCOPE.CORE);
            const downstreamTrajectory = getScopeMetricsForTrajectory(SCOPE.DOWNSTREAM);

            await queryRunner.query(`UPDATE campaign SET result_tco2_upstream = ${upstream.resultTco2} WHERE id = ${campaignId}`);
            await queryRunner.query(`UPDATE campaign SET result_tco2_core = ${core.resultTco2} WHERE id = ${campaignId}`);
            await queryRunner.query(`UPDATE campaign SET result_tco2_downstream = ${downstream.resultTco2} WHERE id = ${campaignId}`);
            await queryRunner.query(`UPDATE campaign SET uncertainty_upstream = ${upstream.uncertainty} WHERE id = ${campaignId}`);
            await queryRunner.query(`UPDATE campaign SET uncertainty_core = ${core.uncertainty} WHERE id = ${campaignId}`);
            await queryRunner.query(`UPDATE campaign SET uncertainty_downstream = ${downstream.uncertainty} WHERE id = ${campaignId}`);

            await queryRunner.query(`UPDATE campaign SET result_tco2_upstream_for_trajectory = ${upstreamTrajectory.resultTco2} WHERE id = ${campaignId}`);
            await queryRunner.query(`UPDATE campaign SET result_tco2_core_for_trajectory = ${coreTrajectory.resultTco2} WHERE id = ${campaignId}`);
            await queryRunner.query(`UPDATE campaign SET result_tco2_downstream_for_trajectory = ${downstreamTrajectory.resultTco2} WHERE id = ${campaignId}`);
            await queryRunner.query(`UPDATE campaign SET uncertainty_upstream_for_trajectory = ${upstreamTrajectory.uncertainty} WHERE id = ${campaignId}`);
            await queryRunner.query(`UPDATE campaign SET uncertainty_core_for_trajectory = ${coreTrajectory.uncertainty} WHERE id = ${campaignId}`);
            await queryRunner.query(`UPDATE campaign SET uncertainty_downstream_for_trajectory = ${downstreamTrajectory.uncertainty} WHERE id = ${campaignId}`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

}
