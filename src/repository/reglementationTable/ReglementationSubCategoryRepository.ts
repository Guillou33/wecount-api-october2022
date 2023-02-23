import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { Content, ReglementationSubCategory } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";

@EntityRepository(ReglementationSubCategory)
export class ReglementationSubCategoryRepository extends Repository<ReglementationSubCategory> {
}

export const addReglementationSubCategoryTranslations = ({ 
  queryBuilder, 
  asName, 
  locale,
}: { 
  queryBuilder: SelectQueryBuilder<any>; 
  asName: string; 
  locale: LOCALE;
}): void => {
  queryBuilder.leftJoinAndMapOne(`${asName}.nameTranslated`, Content, `content${asName}Name`, `content${asName}Name.code = ${asName}.nameContentCode AND content${asName}Name.locale = '${locale}'`);
}
