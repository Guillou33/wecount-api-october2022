import { Company, CompanyGroupMapping, Content, EmissionFactor, EmissionFactorByCompany, EmissionFactorByCompanyGroup, EmissionFactorInfo, EmissionFactorMapping } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { lowerCase } from "lodash";
import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";

@EntityRepository(EmissionFactor)
export class EmissionFactorRepository extends Repository<EmissionFactor> {
  async findAllByText({
    company,
    searchText,
    customLocale,
  }: {
    company?: Company;
    searchText?: string;
    customLocale?: LOCALE;
  }): Promise<EmissionFactor[]> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("ef");

    addEmissionFactorTranslations({
      queryBuilder,
      asName: "ef",
      locale,
    });

    if (!company) {
      queryBuilder.andWhere("ef.isPrivate = false");
    } else {
      queryBuilder.innerJoin(Company, 'company', 'company.id = :companyId', {
          companyId: company.id
        })
        .leftJoin(EmissionFactorByCompanyGroup, `efbcg`, `efbcg.emission_factor_id = ef.id`)
        .leftJoin("efbcg.companyGroup", "cg")
        .leftJoin(CompanyGroupMapping, `cgm`, `cgm.company_group_id = cg.id`)
        .leftJoin("cgm.company", "companyFromGroup")
        .leftJoin(EmissionFactorByCompany, `efbc`, `efbc.emission_factor_id = ef.id`)
        .leftJoin("efbc.company", "directCompany")
        .andWhere("(ef.id IS NULL or ef.inactive = false)")
        .andWhere("(ef.id IS NULL or ef.isPrivate = false or directCompany.id = company.id or companyFromGroup.id = company.id)");
    }

    if (searchText) {
      // contentef0 is set in addEmissionFactorTranslations
      queryBuilder.andWhere("(ef.id IS NULL or contentef0.text LIKE :searchText)", {
        searchText: `%${searchText}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findByTempTagNames(tagNames: string[]): Promise<EmissionFactor[]> {
    tagNames = tagNames.map(tagName => tagName.toLowerCase());
    const queryBuilder = this.createQueryBuilder("e")
      .innerJoin("e.emissionFactorInfo", "efi")
      .where("LOWER(efi.tag1) IN (:...tagNames)", {tagNames})
      .orWhere("LOWER(efi.tag2) IN (:...tagNames)", {tagNames})
      .orWhere("LOWER(efi.tag3) IN (:...tagNames)", {tagNames})
      .orWhere("LOWER(efi.tag4) IN (:...tagNames)", {tagNames});

    const efs = await queryBuilder.getMany();

    return efs;
  }
}

export const addEmissionFactorTranslations = ({ 
  queryBuilder, 
  asName, 
  locale,
}: { 
  queryBuilder: SelectQueryBuilder<any>; 
  asName: string; 
  locale: LOCALE;
}): void => {
  queryBuilder.leftJoinAndMapOne(`${asName}.nameTranslated`, Content, `content${asName}0`, `content${asName}0.code = ${asName}.nameContentCode AND content${asName}0.locale = '${locale}'`)
  .leftJoinAndMapOne(`${asName}.sourceTranslated`, Content, `content${asName}1`, `content${asName}1.code = ${asName}.sourceContentCode AND content${asName}1.locale = '${locale}'`)
  .leftJoinAndMapOne(`${asName}.descriptionTranslated`, Content, `content${asName}2`, `content${asName}2.code = ${asName}.descriptionContentCode AND content${asName}2.locale = '${locale}'`)
  .leftJoinAndMapOne(`${asName}.unitTranslated`, Content, `content${asName}3`, `content${asName}3.code = ${asName}.unitContentCode AND content${asName}3.locale = '${locale}'`)
  .leftJoinAndMapOne(`${asName}.input1UnitTranslated`, Content, `content${asName}4`, `content${asName}4.code = ${asName}.input1UnitContentCode AND content${asName}4.locale = '${locale}'`)
  .leftJoinAndMapOne(`${asName}.input2UnitTranslated`, Content, `content${asName}5`, `content${asName}5.code = ${asName}.input2UnitContentCode AND content${asName}5.locale = '${locale}'`)
  .leftJoinAndMapOne(`${asName}.programTranslated`, Content, `content${asName}6`, `content${asName}6.code = ${asName}.programContentCode AND content${asName}6.locale = '${locale}'`)
  .leftJoinAndMapOne(`${asName}.urlProgramTranslated`, Content, `content${asName}7`, `content${asName}7.code = ${asName}.urlProgramContentCode AND content${asName}7.locale = '${locale}'`)
  .leftJoinAndMapOne(`${asName}.commentTranslated`, Content, `content${asName}8`, `content${asName}8.code = ${asName}.commentContentCode AND content${asName}8.locale = '${locale}'`)
}

