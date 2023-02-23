import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { Content, ReglementationCategory } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";

@EntityRepository(ReglementationCategory)
export class ReglementationCategoryRepository extends Repository<ReglementationCategory> {
}

export const addReglementationCategoryTranslations = ({ 
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
