import { EmissionFactorTag, Content } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";
import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";

@EntityRepository(EmissionFactorTag)
export class EmissionFactorTagRepository extends Repository<EmissionFactorTag> {
}

export const addEmissionFactorTagTranslations = ({ 
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
