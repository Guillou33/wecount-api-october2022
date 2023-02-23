import { ActivityModel, Activity, EmissionFactorMapping, ActivityEntry, ComputeMethod, CompanyGroupMapping, EmissionFactorByCompany, Company, EmissionFactorByCompanyGroup, Content } from "@entity/index";
import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { SearchType } from "@root/entity/enum/SearchType";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { addEmissionFactorTranslations } from "..";
import { addEmissionFactorTagTranslations } from "./EmissionFactorTagRepository";
import { addEmissionFactorTagLabelTranslations } from "./EmissionFactorTagLabelRepository";
import { DbName } from "@root/entity/enum/EmissionFactorEnums";

@EntityRepository(ComputeMethod)
export class ComputeMethodRepository extends Repository<ComputeMethod> {
  async findByActivityModelId(activityModelId: number): Promise<ComputeMethod[]> {
    const queryBuilder = this.createQueryBuilder("cm");
    queryBuilder.innerJoin("cm.activityModel", "am");
    queryBuilder.where("am.id = :activityModelId", {activityModelId});
    return queryBuilder.getMany();
  }
  
  async findAllWithEf({
    company,
    computeMethodId,
    searchText,
    customLocale,
  }: {
    company?: Company;
    computeMethodId?: number;
    searchText?: string;
    customLocale?: LOCALE;
  }): Promise<ComputeMethod[]> {
    const locale = customLocale ?? fallbackLocale;
    const efmJoinCondition = searchText ? '' : "cm.emissionFactorSearchType = 'COMBO_BOX'";
    const queryBuilder = this.createQueryBuilder("cm")
      .leftJoinAndSelect("cm.emissionFactorTagLabelMappings", "eftlm")
      .leftJoinAndSelect("eftlm.emissionFactorTagLabel", "eftlParent")
      .leftJoinAndSelect("eftlParent.emissionFactorMappings", "efm", efmJoinCondition)
      .leftJoinAndSelect("efm.emissionFactor", "ef");

    addEmissionFactorTranslations({
      queryBuilder,
      asName: "ef",
      locale,
    });

    if (computeMethodId) {
      queryBuilder.andWhere("cm.id = :computeMethodId", {
        computeMethodId,
      });
    }

    if (!company) {
      queryBuilder.andWhere("ef.isPrivate = false");
      queryBuilder.andWhere("cm.archivedDate IS NULL");
    } else {
      queryBuilder.innerJoin(Company, 'company', 'company.id = :companyId', {
          companyId: company.id
        })
        .leftJoin(EmissionFactorByCompanyGroup, `efbcg`, `efbcg.emission_factor_id = ef.id ${efmJoinCondition ? 'AND ' + efmJoinCondition : ''}`)
        .leftJoin("efbcg.companyGroup", "cg")
        .leftJoin(CompanyGroupMapping, `cgm`, `cgm.company_group_id = cg.id`)
        .leftJoin("cgm.company", "companyFromGroup")
        .leftJoin(EmissionFactorByCompany, `efbc`, `efbc.emission_factor_id = ef.id  ${efmJoinCondition ? 'AND ' + efmJoinCondition : ''}`)
        .leftJoin("efbc.company", "directCompany")
        .andWhere("(ef.id IS NULL or ef.inactive = false)")
        .andWhere("(ef.id IS NULL or ef.isPrivate = false or directCompany.id = company.id or companyFromGroup.id = company.id)");

      queryBuilder.andWhere("(cm.archivedDate IS NULL OR cm.archivedDate > company.createdAt)");
    }

    if (searchText) {
      // contentef0 is set in addEmissionFactorTranslations
      queryBuilder.andWhere("(ef.id IS NULL or contentef0.text LIKE :searchText)", {
        searchText: `%${searchText}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findAllWithEfAndTags({
    company,
    activityModelId,
    computeMethodId,
    tagIds,
    dbName,
    recommended,
    customLocale,
  }: {
    company?: Company;
    activityModelId?: number;
    computeMethodId?: number;
    tagIds?: number[];
    dbName?: DbName;
    recommended?: boolean;
    customLocale?: LOCALE;
  }): Promise<ComputeMethod[]> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("cm")
      .innerJoin("cm.activityModel", "activityModel")
      .leftJoinAndSelect("cm.emissionFactorTagLabelMappings", "eftlm")
      .leftJoinAndSelect("eftlm.emissionFactorTagLabel", "eftlParent")
      .leftJoinAndSelect("eftlParent.emissionFactorMappings", "efm", "cm.emissionFactorSearchType = 'COMBO_BOX'")
      .leftJoinAndSelect("efm.emissionFactor", "ef")
      .leftJoinAndSelect("eftlParent.childrenLabelMappings", "clms")
      .leftJoinAndSelect("clms.childTag", "eftlChildren")
      .leftJoinAndSelect("eftlChildren.emissionFactorTags", "eft");
    
    addEmissionFactorTagLabelTranslations({
      queryBuilder,
      asName: "eftlParent",
      locale,
    });
    addEmissionFactorTagLabelTranslations({
      queryBuilder,
      asName: "eftlChildren",
      locale,
    });
    addEmissionFactorTagTranslations({
      queryBuilder,
      asName: "eft",
      locale,
    });
    addEmissionFactorTranslations({
      queryBuilder,
      asName: "ef",
      locale,
    });
    addComputeMethodTranslations({
      queryBuilder,
      asName: "cm",
      locale,
    });

    if (recommended) {
      queryBuilder.andWhere("efm.recommended = :recommended", { recommended });
    }
    if (dbName) {
      queryBuilder.andWhere("efm.dbName = :recommended", { recommended });
    }

    if (!company) {
      queryBuilder.andWhere("ef.isPrivate = false");
      queryBuilder.andWhere("cm.archivedDate IS NULL");
    } else {
      queryBuilder.innerJoin(Company, 'company', 'company.id = :companyId', {
          companyId: company.id
        })
        .leftJoin(EmissionFactorByCompanyGroup, `efbcg`, `efbcg.emission_factor_id = ef.id AND cm.emissionFactorSearchType = 'COMBO_BOX'`)
        .leftJoin("efbcg.companyGroup", "cg")
        .leftJoin(CompanyGroupMapping, `cgm`, `cgm.company_group_id = cg.id`)
        .leftJoin("cgm.company", "companyFromGroup")
        .leftJoin(EmissionFactorByCompany, `efbc`, `efbc.emission_factor_id = ef.id AND cm.emissionFactorSearchType = 'COMBO_BOX'`)
        .leftJoin("efbc.company", "directCompany")
        .andWhere("(ef.id IS NULL or ef.inactive = false)")
        .andWhere("(ef.id IS NULL or ef.isPrivate = false or directCompany.id = company.id or companyFromGroup.id = company.id)");

      queryBuilder.andWhere("(cm.archivedDate IS NULL OR cm.archivedDate > company.createdAt)");
    }
    if (activityModelId) {
      queryBuilder.andWhere("activityModel.id = :activityModelId", {
        activityModelId,
      });
    }
    if (computeMethodId) {
      queryBuilder.andWhere("cm.id = :computeMethodId", {
        computeMethodId,
      });
    }

    return queryBuilder.getMany();
  }

  async getForActivity(
    activityId: number,
    computeMethodId: number,
    customLocale?: LOCALE,
  ): Promise<ComputeMethod | undefined> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("cm")
      .innerJoin("cm.activityModel", "activityModel")
      .innerJoin(Activity, "activity", "activityModel.id = activity.activity_model_id")
      .andWhere("cm.id = :cmId", {cmId: computeMethodId})
      .andWhere("activity.id = :aId", {aId: activityId});

    addComputeMethodTranslations({
      queryBuilder,
      asName: "cm",
      locale,
    });
    
    const computeMethod = await queryBuilder.getOne();

    return computeMethod;
  }

  async findOneByAttr({
    activityModel,
    name,
    position,
    isDefault,
  }: {
    activityModel: ActivityModel;
    name: string;
    position: number;
    isDefault: boolean;
  }): Promise<ComputeMethod | undefined> {
    const queryBuilder = this.createQueryBuilder("cm");
    addComputeMethodTranslations({
      queryBuilder,
      asName: 'cm',
      locale: fallbackLocale,
    });
    queryBuilder.andWhere("contentcmName.text = :name", {name})
      .andWhere("cm.activityModel = :activityModel", {activityModel})
      .andWhere("cm.position = :position", {position})
      .andWhere("cm.isDefault = :isDefault", {isDefault});

    const computeMethod = await queryBuilder.getOne();

    return computeMethod;
  }
  
  async getForActivityModel(
    activityModelId: number,
    computeMethodId: number
  ): Promise<ComputeMethod | undefined> {
    const queryBuilder = this.createQueryBuilder("cm")
      .innerJoin("cm.activityModel", "activityModel")
      .andWhere("cm.id = :cmId", { cmId: computeMethodId })
      .andWhere("activityModel.id = :amId", { amId: activityModelId });
  
  
    const computeMethod = await queryBuilder.getOne();
  
    return computeMethod;
  }
}

export const addComputeMethodTranslations = ({ 
  queryBuilder, 
  asName, 
  locale,
}: { 
  queryBuilder: SelectQueryBuilder<any>; 
  asName: string; 
  locale: LOCALE;
}): void => {
  queryBuilder.leftJoinAndMapOne(`${asName}.nameTranslated`, Content, `content${asName}Name`, `content${asName}Name.code = ${asName}.nameContentCode AND content${asName}Name.locale = '${locale}'`)
    .leftJoinAndMapOne(`${asName}.valueNameTranslated`, Content, `content${asName}ValueName`, `content${asName}ValueName.code = ${asName}.valueNameContentCode AND content${asName}ValueName.locale = '${locale}'`)
    .leftJoinAndMapOne(`${asName}.value2NameTranslated`, Content, `content${asName}Value2Name`, `content${asName}Value2Name.code = ${asName}.value2NameContentCode AND content${asName}Value2Name.locale = '${locale}'`)
    .leftJoinAndMapOne(`${asName}.emissionFactorLabelTranslated`, Content, `content${asName}EmissionFactorLabel`, `content${asName}EmissionFactorLabel.code = ${asName}.emissionFactorLabelContentCode AND content${asName}EmissionFactorLabel.locale = '${locale}'`);
}


