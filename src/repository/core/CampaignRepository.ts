import { Campaign, Perimeter } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";
import { SCOPE } from "@entity/enum/Scope";
import { User, ActivityEntry, UserRoleWithinPerimeter } from "@entity/index";
import { ROLES } from "@root/service/core/security/auth/config";
import { CampaignType } from "@root/entity/enum/CampaignType";
import { CampaignStatus } from "@root/entity/enum/CampaignStatus";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { addActivityModelTranslations } from "../activity/ActivityModelRepository";

@EntityRepository(Campaign)
export class CampaignRepository extends Repository<Campaign> {
  async findAllForUser(user: User): Promise<Campaign[]> {
    const queryBuilder = this.createQueryBuilder("c")
      .innerJoinAndSelect("c.perimeter", "perimeter")
      .innerJoinAndSelect("perimeter.userRoleWithinPerimeters", "urwp")
      .innerJoin(
        User,
        "u",
        "u.id = urwp.user_id AND u.id = :userId AND perimeter.soft_deleted_at IS NULL",
        {
          userId: user.id,
        }
      );

    const campaigns = await queryBuilder.getMany();

    return campaigns;
  }

  async findAllForManager(user: User): Promise<Campaign[]> {
    const queryBuilder = this.createQueryBuilder("c")
      .innerJoin("c.perimeter", "perimeter")
      .innerJoin("perimeter.company", "company")
      .innerJoin(
        User,
        "u",
        "u.company_id = company.id AND u.id = :userId AND perimeter.soft_deleted_at IS NULL",
        {
          userId: user.id,
        }
      );

    const campaigns = await queryBuilder.getMany();

    return campaigns;
  }

  async findFull(campaignId: number): Promise<Campaign | undefined> {
    const queryBuilder = this.createQueryBuilder("c")
      .innerJoinAndSelect("c.perimeter", "perimeter")
      .innerJoinAndSelect("perimeter.company", "company")
      .leftJoinAndSelect("c.activities", "activity")
      .leftJoinAndSelect("activity.activityModel", "am")
      .leftJoinAndSelect("activity.activityEntries", "activityEntries")
      .leftJoinAndSelect("activityEntries.activityEntryReference", "aer")
      .leftJoinAndSelect("activityEntries.emissionFactor", "emissionFactor")
      .leftJoinAndSelect("activityEntries.computeMethod", "computeMethod")
      .leftJoinAndSelect("c.trajectories", "campaignTrajectory")
      .leftJoinAndSelect("activityEntries.product", "product")
      .leftJoinAndSelect("activityEntries.site", "site")
      .leftJoinAndSelect("activityEntries.owner", "owner")
      .leftJoinAndSelect("activityEntries.writer", "writer")
      .leftJoinAndSelect("activityEntries.entryTagMappings", "etm")
      .leftJoinAndSelect("etm.entryTag", "et")
      .andWhere("c.id = :campaignId", { campaignId });

    const campaign = await queryBuilder.getOne();

    return campaign;
  }

  async findFullWithoutTrajectory(campaignId: number): Promise<Campaign | undefined> {
    const queryBuilder = this.createQueryBuilder("c")
      .innerJoinAndSelect("c.perimeter", "perimeter")
      .innerJoinAndSelect("perimeter.company", "company")
      .leftJoinAndSelect("c.activities", "activity")
      .leftJoinAndSelect("activity.activityModel", "am")
      .leftJoinAndSelect("activity.activityEntries", "activityEntries")
      .leftJoinAndSelect("activityEntries.activityEntryReference", "aer")
      .leftJoinAndSelect("activityEntries.emissionFactor", "emissionFactor")
      .leftJoinAndSelect("activityEntries.computeMethod", "computeMethod")
      // .leftJoinAndSelect("c.trajectories", "campaignTrajectory")
      .leftJoinAndSelect("activityEntries.product", "product")
      .leftJoinAndSelect("activityEntries.site", "site")
      .leftJoinAndSelect("activityEntries.owner", "owner")
      .leftJoinAndSelect("activityEntries.writer", "writer")
      .leftJoinAndSelect("activityEntries.entryTagMappings", "etm")
      .leftJoinAndSelect("etm.entryTag", "et")
      .andWhere("c.id = :campaignId", { campaignId });

    const campaign = await queryBuilder.getOne();

    return campaign;
  }

  async findOneForActivity(activityId: number): Promise<Campaign | undefined> {
    const queryBuilder = this.createQueryBuilder("c")
      .innerJoin("c.activities", "activity")
      .andWhere("activity.id = :activityId", { activityId });

    const campaign = await queryBuilder.getOne();

    return campaign;
  }

  async existingActiveCampaignForTypeAndYear({
    type,
    year,
    perimeter,
    currentId,
  }: {
    type: CampaignType,
    year: number,
    perimeter: Perimeter,
    currentId?: number,
  }): Promise<Campaign | undefined> {
    const queryBuilder = this.createQueryBuilder("c")
      .innerJoin("c.perimeter", "perimeter")
      .andWhere("c.type = :type", { type })
      .andWhere("c.year = :year", { year })
      .andWhere("perimeter.id = :perimeterId", { perimeterId: perimeter.id })
      .andWhere("c.status != :archivedStatus", { archivedStatus: CampaignStatus.ARCHIVED })
    ;

    if (currentId) {
      queryBuilder.andWhere("c.id != :currentId", { currentId })
    }

    const campaign = await queryBuilder.getOne();

    return campaign;
  }

  async findOneForActivityEntry(
    activityEntryId: number
  ): Promise<Campaign | undefined> {
    const queryBuilder = this.createQueryBuilder("c")
      .innerJoin("c.activities", "activity")
      .innerJoin("activity.activityEntries", "ae")
      .andWhere("ae.id = :activityEntryId", { activityEntryId });

    const campaign = await queryBuilder.getOne();
    return campaign;
  }

  async getTotals(campaignId: number) {
    const rawResult = await this.query(
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

    return {
      [SCOPE.UPSTREAM]: getScopeMetrics(SCOPE.UPSTREAM),
      [SCOPE.CORE]: getScopeMetrics(SCOPE.CORE),
      [SCOPE.DOWNSTREAM]: getScopeMetrics(SCOPE.DOWNSTREAM),
    };
  }

  async getTotalsForTrajectory(campaignId: number) {
    const rawResult = await this.query(
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

    return {
      [SCOPE.UPSTREAM]: getScopeMetrics(SCOPE.UPSTREAM),
      [SCOPE.CORE]: getScopeMetrics(SCOPE.CORE),
      [SCOPE.DOWNSTREAM]: getScopeMetrics(SCOPE.DOWNSTREAM),
    };
  }

  async findWithActivities(campaignIds: number[], customLocale?: LOCALE): Promise<Campaign[]> {
      const locale = customLocale ?? fallbackLocale;
      const queryBuilder = this.createQueryBuilder("c")
        .innerJoinAndSelect("c.activities", "a")
        .innerJoinAndSelect("a.activityModel", "activityModel");
      addActivityModelTranslations({
        queryBuilder,
        asName: "activityModel",
        locale,
      });
      queryBuilder.andWhere("c.id IN (:campaignIds)", {campaignIds: campaignIds});
  
      const campaigns = await queryBuilder.getMany();
  
      return campaigns;
    }
}
