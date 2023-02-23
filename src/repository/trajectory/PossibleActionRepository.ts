import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { Content, PossibleAction } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";

@EntityRepository(PossibleAction)
export class PossibleActionRepository extends Repository<PossibleAction> {
}

export const addPossibleActionTranslations = ({ 
  queryBuilder, 
  asName, 
  locale,
}: { 
  queryBuilder: SelectQueryBuilder<any>; 
  asName: string; 
  locale: LOCALE;
}): void => {
  queryBuilder.leftJoinAndMapOne(`${asName}.nameTranslated`, Content, `content${asName}0`, `content${asName}0.code = ${asName}.nameContentCode AND content${asName}0.locale = '${locale}'`);
}
