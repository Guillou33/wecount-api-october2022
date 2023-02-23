import { Campaign, Perimeter, User } from "@root/entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(Perimeter)
export class PerimeterRepository extends Repository<Perimeter> {

    async getCategoriesAndActivityModelsEntries(user: User){
        const companyId = user.company.id;
        const perimeters = await this.query(
            `SELECT 
                p.id as "perimeterId",
                c.id as "campaignId",
                ac.id as "categoryId",
                am.id as "activityModelId",
                ac.scope as scope,
                CASE
                    WHEN
                        ae.is_excluded_from_trajectory = 0
                    THEN
                        SUM(ae.result_tco2)
                    ELSE
                        0
                    END AS tco2Included,
                CASE
                    WHEN
                        ae.is_excluded_from_trajectory = 1
                    THEN
                        SUM(ae.result_tco2)
                    ELSE
                        0
                    END AS tco2Excluded,
                CASE
                    WHEN
                        ae.is_excluded_from_trajectory = 0
                    THEN
                        COUNT(ae.id)
                    ELSE
                        0
                    END AS "nbrEntriesIncluded",
                CASE
                    WHEN
                        ae.is_excluded_from_trajectory = 1
                    THEN
                        COUNT(ae.id)
                    ELSE
                        0
                    END AS "nbrEntriesExcluded"
                /*SUM(ae.result_tco2) as tco2,
                COUNT(ae.id) as "nbrEntries"*/
            FROM campaign c
            LEFT JOIN perimeter p ON p.id = c.perimeter_id
            INNER JOIN activity a ON a.campaign_id = c.id
            INNER JOIN activity_entry ae ON ae.activity_id = a.id
            LEFT JOIN emission_factor ef ON ef.id = ae.emission_factor_id
            INNER JOIN activity_model am ON a.activity_model_id = am.id
            INNER JOIN activity_category ac ON am.activity_category_id = ac.id
            WHERE p.company_id = ?
                AND a.status != 'ARCHIVED'
                AND a.soft_deleted_at IS NULL
                AND ae.soft_deleted_at IS NULL
                /*AND ae.is_excluded_from_trajectory = 0*/
                AND c.soft_deleted_at IS NULL
            GROUP BY p.id,
                c.id,
                ac.id,
                am.id,
                ac.scope,
                ae.id
            ORDER BY p.id`,
            [companyId]
        );
        return perimeters;
    }
}