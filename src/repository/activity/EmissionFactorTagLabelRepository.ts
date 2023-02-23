import { EmissionFactorTagLabel, Content } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";
import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";

@EntityRepository(EmissionFactorTagLabel)
export class EmissionFactorTagLabelRepository extends Repository<EmissionFactorTagLabel> {
}

export const addEmissionFactorTagLabelTranslations = ({ 
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
