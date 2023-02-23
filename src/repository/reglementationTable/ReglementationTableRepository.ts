import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { Content, ReglementationTable } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";

@EntityRepository(ReglementationTable)
export class ReglementationTableRepository extends Repository<ReglementationTable> {
}

export const addReglementationTableTranslations = ({ 
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
