import { Activity, ActivityEntry, EmissionFactor } from "@entity/index";
import { CampaignType } from "@root/entity/enum/CampaignType";
import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";
import { ElementType } from "@root/entity/enum/EmissionFactorEnums";
import { addComputeMethodTranslations, addEmissionFactorTranslations } from "..";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";

export interface CsvExportResultRow {
  campaign_name: string;
  campaign_description: string;
  scope: string;
  category_name: string;
  model_name: string;
  model_description: string;
  status: string;
  title: string;
  ae_instruction: string;
  cm_type: string;
  cm_name: string;
  input_name_1: string;
  input_value_1: number | null;
  input_unit_1: string | null;
  input_name_2: string | null;
  input_value_2: number | null;
  input_unit_2: string | null;
  result_tco2: number;
  entry_uncertainty: number | null;
  entry_description: string | null;
  data_source: string;
  cef_name: string | null;
  cef_value: number | null;
  cef_input_1_name: string | null;
  cef_input_1_unit: string | null;
  ef_value: number;
  ef_source: string;
  ef_uncertainty: number;
  ae_trajectory_status: string | boolean;
  activity_entry_tags: string | null;
  product_name: string | null;
  site_name: string | null;
  ef_name: string | null;
  ef_unit: string | null;
  ae_manual_tco2: number | null;
  ae_manual_unit_number: number | null;
}
export type CsvExportResult = CsvExportResultRow[];

@EntityRepository(ActivityEntry)
export class ActivityEntryRepository extends Repository<ActivityEntry> {
  async findOneWithMainRelations(activityEntryId: number): Promise<ActivityEntry | undefined> {
    const queryBuilder = this.createQueryBuilder("a")
      .innerJoinAndSelect("a.activity", "activity")
      .innerJoinAndSelect("a.activityEntryReference", "activityEntryReference")
      .innerJoinAndSelect("activity.campaign", "campaign")
      .innerJoinAndSelect("campaign.perimeter", "perimeter")
      .innerJoinAndSelect("perimeter.company", "company")
      .leftJoinAndSelect("a.owner", "owner")
      .leftJoinAndSelect("a.writer", "writer")
      .leftJoinAndSelect("a.entryTagMappings", "entryTagMappings");
    queryBuilder.andWhere("a.id = :activityEntryId", {activityEntryId});

    const activityEntry = await queryBuilder.getOne();

    return activityEntry;
  }

  async findAllForActivityWithFullEF(
    activityId: number,
    customLocale?: LOCALE,
  ): Promise<ActivityEntry[]> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("a")
      .innerJoin("a.activity", "activity")
      .leftJoinAndSelect("a.site", "site")
      .leftJoinAndSelect("a.product", "product")
      .leftJoinAndSelect("a.computeMethod", "computeMethod")
      .andWhere("activity.id = :activityId", { activityId })
      .orderBy("a.created_at", "DESC");
    addComputeMethodTranslations({
      queryBuilder,
      asName: "computeMethod",
      locale,
    });
    this.addFullEf(queryBuilder, locale);

    const activityEntries = await queryBuilder.getMany();

    return activityEntries;
  }

  async findHistoryForActivityEntryReference({
    activityEntryReferenceId,
    customLocale,
  }: {
    activityEntryReferenceId: number;
    customLocale?: LOCALE;
  }): Promise<ActivityEntry[]> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("a")
      .innerJoinAndSelect("a.computeMethod", "cm");
    addComputeMethodTranslations({
      queryBuilder: queryBuilder,
      asName: "cm",
      locale,
    });
    queryBuilder
      .innerJoinAndSelect("a.activity", "activity")
      .innerJoinAndSelect("activity.campaign", "c")
      .innerJoin("a.activityEntryReference", "aer")
      .leftJoinAndSelect("a.entryTagMappings", "aet")
      .andWhere("aer.id = :activityEntryReferenceId", {
        activityEntryReferenceId,
      })
      .andWhere("(c.type = :typeFootprint OR c.type = :typeSimulation)", {
        typeFootprint: CampaignType.CARBON_FOOTPRINT,
        typeSimulation: CampaignType.SIMULATION,
      })
      .andWhere("c.softDeletedAt IS NULL")
      .orderBy("c.year", "ASC");
    this.addFullEf(queryBuilder, locale);

    const activityEntries = await queryBuilder.getMany();

    return activityEntries;
  }

  async findWithFullEF(
    activityEntryId: number,
    customLocale?: LOCALE,
  ): Promise<ActivityEntry | undefined> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("a").andWhere("a.id = :id", {
      id: activityEntryId,
    });
    queryBuilder.innerJoinAndSelect("a.activityEntryReference", "aer");
    this.addFullEf(queryBuilder, locale);

    const activityEntry = await queryBuilder.getOne();

    return activityEntry;
  }

  private addFullEf(qb: SelectQueryBuilder<ActivityEntry>, locale: LOCALE) {
    qb.leftJoinAndSelect("a.customEmissionFactor", "cef");
    qb.leftJoinAndSelect("a.emissionFactor", "ef");
    addEmissionFactorTranslations({
      queryBuilder: qb,
      asName: "ef",
      locale,
    });
    qb.leftJoinAndSelect("ef.emissionFactorInfo", "efi");
  }

  async getCsvExport(campaignId: number, customLocale?: LOCALE): Promise<CsvExportResult> {
    const locale = customLocale ?? fallbackLocale;
    const rawResult: CsvExportResult = await this.query(
      `SELECT
        c.name as campaign_name,
        c.description as campaign_description,
        ac.scope,
        MAX(trans_content_ac_name.text) as category_name,
        MAX(trans_content_am_name.text) as model_name,
        MAX(trans_content_am_description.text) as model_description,
        a.status as status,
        ae.is_excluded_from_trajectory as ae_trajectory_status,
        ae.instruction as ae_instruction,
        ae.compute_method_type as cm_type,
        MAX(trans_content_cm_value_name.text) as input_name_1,
        MAX(trans_content_cm_name.text) as cm_name,
        ae.manual_tco2 as ae_manual_tco2,
        ae.manual_unit_number as ae_manual_unit_number,
        ae.value as input_value_1,
        MAX(trans_content_ef_input1_unit.text) as input_unit_1,
        MAX(trans_content_cm_value2_name.text) as input_name_2,
        ae.value2 as input_value_2,
        MAX(trans_content_ef_input2_unit.text) as input_unit_2,
        ae.uncertainty as entry_uncertainty,
        cef.name as cef_name,
        cef.value as cef_value,
        cef.input1_name as cef_input_1_name,
        cef.input1_unit as cef_input_1_unit,
        MAX(trans_content_ef_name.text) as ef_name,
        ef.value as ef_value,
        MAX(trans_content_ef_unit.text) as ef_unit,
        ef.uncertainty as ef_uncertainty,
        ae.result_tco2,
        MAX(trans_content_ef_source.text) as ef_source,
        ae.description as entry_description,
        ae.data_source,
        product.name as product_name,
        site.name as site_name,
        GROUP_CONCAT(et.name SEPARATOR ', ') as activity_entry_tags
      FROM activity_entry ae
        LEFT JOIN product ON product.id = ae.product_id
        LEFT JOIN site ON site.id = ae.site_id
        INNER JOIN activity a ON a.id = ae.activity_id
        INNER JOIN activity_model am ON a.activity_model_id = am.id
        INNER JOIN activity_category ac ON ac.id = am.activity_category_id
        INNER JOIN campaign c ON c.id = a.campaign_id
        LEFT JOIN emission_factor ef ON ef.id = ae.emission_factor_id
        LEFT JOIN custom_emission_factor cef ON cef.id = ae.custom_emission_factor_id
        LEFT JOIN compute_method cm ON cm.id = ae.compute_method_id
        LEFT JOIN entry_tag_mapping etm ON ae.id = etm.activity_entry_id
        LEFT JOIN entry_tag et ON etm.entry_tag_id = et.id
        LEFT JOIN content as trans_content_ac_name ON trans_content_ac_name.code = ac.name_content_code AND trans_content_ac_name.locale = 'fr-FR'
        LEFT JOIN content as trans_content_am_name ON trans_content_am_name.code = am.name_content_code AND trans_content_am_name.locale = 'fr-FR'
        LEFT JOIN content as trans_content_am_description ON trans_content_am_description.code = am.description_content_code AND trans_content_am_description.locale = 'fr-FR'
        LEFT JOIN content as trans_content_cm_value_name ON trans_content_cm_value_name.code = cm.value_name_content_code AND trans_content_cm_value_name.locale = 'fr-FR'
        LEFT JOIN content as trans_content_cm_value2_name ON trans_content_cm_value2_name.code = cm.value2_name_content_code AND trans_content_cm_value2_name.locale = 'fr-FR'
        LEFT JOIN content as trans_content_cm_name ON trans_content_cm_name.code = cm.name_content_code AND trans_content_cm_name.locale = 'fr-FR'
        LEFT JOIN content as trans_content_ef_input1_unit ON trans_content_ef_input1_unit.code = ef.input1_unit_content_code AND trans_content_ef_input1_unit.locale = 'fr-FR'
        LEFT JOIN content as trans_content_ef_input2_unit ON trans_content_ef_input2_unit.code = ef.input2_unit_content_code AND trans_content_ef_input2_unit.locale = 'fr-FR'
        LEFT JOIN content as trans_content_ef_name ON trans_content_ef_name.code = ef.name_content_code AND trans_content_ef_name.locale = 'fr-FR'
        LEFT JOIN content as trans_content_ef_unit ON trans_content_ef_unit.code = ef.unit_content_code AND trans_content_ef_unit.locale = 'fr-FR'
        LEFT JOIN content as trans_content_ef_source ON trans_content_ef_source.code = ef.source_content_code AND trans_content_ef_source.locale = 'fr-FR'
      WHERE c.id = ?
        AND ae.soft_deleted_at IS NULL
        AND a.soft_deleted_at IS NULL
        AND c.soft_deleted_at IS NULL
      GROUP BY ae.id
      ORDER BY 
        CASE WHEN ac.scope = 'UPSTREAM' THEN 1 WHEN ac.scope = 'CORE' THEN 2 ELSE 3 END,
        trans_content_ac_name.text,
        trans_content_am_name.text
        `,
      [campaignId]
    );

    return rawResult;
  }
}
