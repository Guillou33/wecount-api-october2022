import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { Content, ScopeActionPlanHelp } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";

@EntityRepository(ScopeActionPlanHelp)
export class ScopeActionPlanHelpRepository extends Repository<ScopeActionPlanHelp> {
  async findAll({
    customLocale,
  }: {
    customLocale?: LOCALE,
  }): Promise<ScopeActionPlanHelp[]> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("s");
    addScopeActionPlanHelpTranslations({
      queryBuilder,
      asName: "s",
      locale,
    })

    const scopeActionPlanHelps = await queryBuilder.getMany();
    return scopeActionPlanHelps;
  }
}

export const addScopeActionPlanHelpTranslations = ({ 
  queryBuilder, 
  asName, 
  locale,
}: { 
  queryBuilder: SelectQueryBuilder<any>; 
  asName: string; 
  locale: LOCALE;
}): void => {
  queryBuilder.leftJoinAndMapOne(`${asName}.helpTranslated`, Content, `content${asName}0`, `content${asName}0.code = ${asName}.helpContentCode AND content${asName}0.locale = '${locale}'`);
}
