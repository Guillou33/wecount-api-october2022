import { Activity, Content } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { EntityRepository, Repository } from "typeorm";
import { addActivityModelTranslations } from "..";

@EntityRepository(Activity)
export class ActivityRepository extends Repository<Activity> {

  async findOneWithMainRelations(activityId: number, customLocale?: LOCALE): Promise<Activity | undefined> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("a")
      .innerJoinAndSelect("a.activityModel", "activityModel")
      .innerJoinAndSelect("a.campaign", "campaign")
      .innerJoinAndSelect("a.perimeter", "perimeter")
      .innerJoinAndSelect("p.company", "company")
      .leftJoinAndSelect("a.owner", "owner");
    addActivityModelTranslations({
      queryBuilder,
      asName: "activityModel",
      locale,
    });
    queryBuilder.andWhere("a.id = :activityId", {activityId});

    const activity = await queryBuilder.getOne();

    return activity;
  }

  async findAllForCampaign(campaignId: number, customLocale?: LOCALE): Promise<Activity[]> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("a")
      .innerJoinAndSelect("a.activityModel", "activityModel");
    addActivityModelTranslations({
      queryBuilder,
      asName: "activityModel",
      locale,
    });
    queryBuilder.innerJoin("a.campaign", "c")
      .andWhere("c.id = :campaignId", {campaignId})
    ;

    const activities = await queryBuilder.getMany();

    return activities;
  }

  async findNumberCodes(activityId: number): Promise<{
    categoryNumberCode: number;
    modelNumberCode: number;
  }> {
    
    const queryBuilder = this.createQueryBuilder("a")
      .innerJoinAndSelect("a.activityModel", "activityModel")
      .innerJoinAndSelect("activityModel.activityCategory", "ac")
      .andWhere("a.id = :activityId", {activityId})
    ;

    const activity = await queryBuilder.getOne();
    if (!activity) {
      throw new Error("Activity unfound");
    }

    return {
      categoryNumberCode: activity.activityModel.activityCategory.numberCode,
      modelNumberCode: activity.activityModel.numberCode,
    };
  }
}
