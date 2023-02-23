import { ActivityModel, Activity, Content, ActivityCategory } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { addActivityCategoryTranslations } from "..";

@EntityRepository(ActivityModel)
export class ActivityModelRepository extends Repository<ActivityModel> {
  async findOneForActivityId(
    activityId: number,
    customLocale?: LOCALE,
  ): Promise<ActivityModel | undefined> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("a")
      .innerJoin(Activity, "activity", "a.id = activity.activity_model_id")
      .andWhere("activity.id = :activityId", { activityId });

    addActivityModelTranslations({
      queryBuilder,
      asName: "a",
      locale,
    });

    const activityModel = await queryBuilder.getOne();

    return activityModel;
  }

  async findOneWithCategory(
    activityModelId: number,
    customLocale?: LOCALE,
  ): Promise<ActivityModel | undefined> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("a")
      .innerJoinAndSelect("a.activityCategory", "ac")
      .andWhere("a.id = :activityModelId", { activityModelId });

    addActivityModelTranslations({
      queryBuilder,
      asName: "a",
      locale,
    });
    addActivityCategoryTranslations({
      queryBuilder,
      asName: "ac",
      locale,
    });

    const activityModel = await queryBuilder.getOne();

    return activityModel;
  }

  async findOneByAttr({
    activityCategory,
    name,
  }: {
    activityCategory: ActivityCategory,
    name: string,
  } ): Promise<ActivityModel | undefined> {
    const queryBuilder = this.createQueryBuilder("am");
    addActivityModelTranslations({
      queryBuilder,
      asName: 'am',
      locale: fallbackLocale,
    });
    queryBuilder.andWhere("contentam0.text = :name", {name})
      .andWhere("am.activityCategory = :activityCategory", {activityCategory});

    const activityModel = await queryBuilder.getOne();

    return activityModel;
  }
}

export const addActivityModelTranslations = ({ 
  queryBuilder, 
  asName, 
  locale,
}: { 
  queryBuilder: SelectQueryBuilder<any>; 
  asName: string; 
  locale: LOCALE;
}): void => {
  queryBuilder.leftJoinAndMapOne(`${asName}.nameTranslated`, Content, `content${asName}0`, `content${asName}0.code = ${asName}.nameContentCode AND content${asName}0.locale = '${locale}'`)
      .leftJoinAndMapOne(`${asName}.descriptionTranslated`, Content, `content${asName}1`, `content${asName}1.code = ${asName}.descriptionContentCode AND content${asName}1.locale = '${locale}'`)
      .leftJoinAndMapOne(`${asName}.helpTranslated`, Content, `content${asName}2`, `content${asName}2.code = ${asName}.helpContentCode AND content${asName}2.locale = '${locale}'`)
      .leftJoinAndMapOne(`${asName}.helpIframeTranslated`, Content, `content${asName}3`, `content${asName}3.code = ${asName}.helpIframeContentCode AND content${asName}3.locale = '${locale}'`)
      .leftJoinAndMapOne(`${asName}.seeMoreTranslated`, Content, `content${asName}4`, `content${asName}4.code = ${asName}.seeMoreContentCode AND content${asName}4.locale = '${locale}'`)
      .leftJoinAndMapOne(`${asName}.seeMoreIframeTranslated`, Content, `content${asName}5`, `content${asName}5.code = ${asName}.seeMoreIframeContentCode AND content${asName}5.locale = '${locale}'`)
}
