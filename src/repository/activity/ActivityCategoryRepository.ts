import { ActivityCategory, Company, ActivityModelByCompanyGroup, CompanyGroupMapping, ActivityModelByCompany, Campaign, Activity, ComputeMethod, Perimeter, ActivityEntry, Content } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";
import { SCOPE } from "@root/entity/enum/Scope";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { addActivityModelTranslations } from "..";
import { addPossibleActionTranslations } from "../trajectory/PossibleActionRepository";

@EntityRepository(ActivityCategory)
export class ActivityCategoryRepository extends Repository<ActivityCategory> {
  // Select :
  // - public activities
  // - private activities linked to a company group we belong to
  // - private activities linked to our company
  async findAllWithActivityModels(
    company: Company,
    customLocale?: LOCALE,
  ): Promise<ActivityCategory[]> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("a");
    addActivityCategoryTranslations({
      queryBuilder,
      asName: 'a',
      locale,
    });
    queryBuilder.leftJoinAndMapOne("a.nameTranslated", Content, "contentName", `contentName.code = a.nameContentCode AND contentName.locale = '${locale}'`)
      .leftJoinAndMapOne("a.descriptionTranslated", Content, "contentDesc", `contentDesc.code = a.descriptionContentCode AND contentDesc.locale = '${locale}'`)
      .leftJoinAndMapOne("a.actionPlanHelpTranslated", Content, "contentAPH", `contentAPH.code = a.actionPlanHelpContentCode AND contentAPH.locale = '${locale}'`)
      .leftJoinAndSelect("a.possibleActions", "pa")
      .leftJoinAndSelect(
        "a.activityModels",
        "am"
      )
      .leftJoinAndSelect(
        "am.possibleActions",
        "ampm"
      );
    addActivityModelTranslations({
      queryBuilder,
      asName: 'am',
      locale,
    });
    addPossibleActionTranslations({
      queryBuilder,
      asName: 'pa',
      locale,
    });
    addPossibleActionTranslations({
      queryBuilder,
      asName: 'ampm',
      locale,
    });
    queryBuilder.leftJoinAndMapOne("am.nameTranslated", Content, "content0", `content0.code = am.nameContentCode AND content0.locale = '${locale}'`)
      .leftJoinAndMapOne("am.descriptionTranslated", Content, "content1", `content1.code = am.descriptionContentCode AND content1.locale = '${locale}'`)
      .leftJoinAndMapOne("am.helpTranslated", Content, "content2", `content2.code = am.helpContentCode AND content2.locale = '${locale}'`)
      .leftJoinAndMapOne("am.helpIframeTranslated", Content, "content3", `content3.code = am.helpIframeContentCode AND content3.locale = '${locale}'`)
      .leftJoinAndMapOne("am.seeMoreTranslated", Content, "content4", `content4.code = am.seeMoreContentCode AND content4.locale = '${locale}'`)
      .leftJoinAndMapOne("am.seeMoreIframeTranslated", Content, "content5", `content5.code = am.seeMoreIframeContentCode AND content5.locale = '${locale}'`)
      .leftJoin(ActivityModelByCompanyGroup, `ambcg`, `ambcg.activity_model_id = am.id`)
      .leftJoin("ambcg.companyGroup", "cg")
      .leftJoin(CompanyGroupMapping, `cgm`, `cgm.company_group_id = cg.id`)
      .leftJoin("cgm.company", "companyFromGroup")
      .leftJoin(ActivityModelByCompany, `ambc`, `ambc.activity_model_id = am.id`)
      .leftJoin("ambc.company", "directCompany")
      .innerJoin(Company, "company", "company.id = :companyId", {
        companyId: company.id
      })
      .andWhere("(am.archivedDate IS NULL OR am.archivedDate > company.createdAt) AND (am.isPrivate = false or directCompany.id = company.id or companyFromGroup.id = company.id)")
      .orderBy("a.id, am.position, am.id, pa.id, ampm.id")
    ;

    const activityCategories = await queryBuilder.getMany();

    return activityCategories;
  }

  async findOneByAttr({
    name,
    iconName,
    description,
    scope,
  }: {
    name: string,
    iconName: string | null,
    description: string | null,
    scope: SCOPE,
  } ): Promise<ActivityCategory | undefined> {
    const queryBuilder = this.createQueryBuilder("ac");
    addActivityCategoryTranslations({
      queryBuilder,
      asName: 'ac',
      locale: fallbackLocale,
    });
    queryBuilder.andWhere("contentacName.text = :name", {name})
      .andWhere("ac.scope = :scope", {scope});
    
    if (description) {
      queryBuilder.andWhere("contentacDesc.text = :description", {description});
    } else {
      queryBuilder.andWhere("ac.descriptionContentCode IS NULL");
    }
    if (iconName) {
      queryBuilder.andWhere("ac.iconName = :iconName", {iconName});
    } else {
      queryBuilder.andWhere("ac.iconName IS NULL");
    }

    const activityCategory = await queryBuilder.getOne();

    return activityCategory;
  }
}

export const addActivityCategoryTranslations = ({ 
  queryBuilder, 
  asName, 
  locale,
}: { 
  queryBuilder: SelectQueryBuilder<any>; 
  asName: string; 
  locale: LOCALE;
}): void => {
  queryBuilder.leftJoinAndMapOne(`${asName}.nameTranslated`, Content, `content${asName}Name`, `content${asName}Name.code = ${asName}.nameContentCode AND content${asName}Name.locale = '${locale}'`)
  .leftJoinAndMapOne(`${asName}.descriptionTranslated`, Content, `content${asName}Desc`, `content${asName}Desc.code = ${asName}.descriptionContentCode AND content${asName}Desc.locale = '${locale}'`)
  .leftJoinAndMapOne(`${asName}.actionPlanHelpTranslated`, Content, `content${asName}APH`, `content${asName}APH.code = ${asName}.actionPlanHelpContentCode AND content${asName}APH.locale = '${locale}'`)
}
