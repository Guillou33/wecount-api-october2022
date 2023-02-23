import { Request, Response } from "express";
import { get, controller, post, put, use, del } from "@deep/routing/decorators";
import { Campaign, Company, Activity } from "@entity/index";
import { CampaignRepository, CompanyRepository } from "@repository/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import { body, param } from "express-validator";
import typeOrNull from "@service/utils/typeOrNull";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import NotFoundError from "@deep/responseError/NotFoundError";
import { campaignManager, activityEntryManager, activityManager } from "@manager/index";
import { CsvExportResultRow } from "@repository/activity/ActivityEntryRepository";
import { classToPlain } from 'class-transformer';
import { validateCampaign } from '@controller/core/helpers/validateCampaign';
import { validatePerimeter } from '@controller/core/helpers/validatePerimeter';
import csvStringify from "csv-stringify/lib/sync";
import { SCOPE } from "@root/entity/enum/Scope";
import { Status } from "@root/entity/enum/Status";
import { ComputeMethodType } from "@root/entity/enum/ComputeMethodType";
import { roleManager } from "@root/service/core/security/auth/RoleManager";
import { ROLES } from '@service/core/security/auth/config';
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";
import { validateActivityEntry } from "../activity/helpers/validateActivityEntry";
import { CampaignType } from "@root/entity/enum/CampaignType";
import { CampaignExistsForYearAndTypeError } from "@root/manager/core/campaignManager";
import { CustomError } from "@root/service/core/error/response";
import { CampaignStatus } from "@root/entity/enum/CampaignStatus";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import translations from "@root/translations/translations";
import { upperFirst } from "lodash";
import { validateComputeMethodForActivityModel } from "./helpers/validateComputeMethodForActivityModel";
import { EntryData, multipleEntryDataValidator } from "./helpers/multipleEntryData";
import { getActivityModelsInvolved } from "./helpers/getActivityModelsInvolved";

type RowCsvColumns = keyof CsvExportResultRow;
type FormattedCsvColumns = Omit<
  CsvExportResultRow,
  "cm_name" | "ae_manual_tco2" | "ae_manual_unit_number" | "cef_name" | "cef_value" | "cef_input_1_name" | "cef_input_1_unit"
>;

@controller("/campaigns")
class CampaignController extends BaseController {
  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id")
  async getCampaign(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(id, user!);

    await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireContributor();

    res.send(classToPlain(campaign));
  }

  @get("")
  async getCampaigns(req: CustomRequest, res: Response) {
    const user = await this.getUser(req);
    if (!user) throw new Error("Undefined user");

    const campaignRepository = this.em.getCustomRepository(CampaignRepository);
    let campaigns;
    if (roleManager.isGranted({ roles: user.getRoles() }, ROLES.ROLE_MANAGER)) {
      campaigns = await campaignRepository.findAllForManager(user);
    } else {
      const campaignsWithRole = await campaignRepository.findAllForUser(user);
      campaigns = campaignsWithRole.filter(campaignWithRole => {
        const role = campaignWithRole.perimeter.userRoleWithinPerimeters[0].role;
        if (!role) {
          return false;
        }
        return campaignManager.canAccessCampaign(campaignWithRole.status, role);
      });
    }

    res.send(classToPlain(campaigns));
  }

  @use([
    body("campaignTemplateId").optional().toInt(),
    body("withTemplateValues").optional().isBoolean(),
    body("name").exists().isString(),
    body("description").optional().isString(),
    body("perimeterId").exists().toInt(),
    body("year").toInt(),
    body("type").exists().custom((value) => Object.values(CampaignType).includes(value)),
    expressValidatorThrower,
  ])
  @post("")
  async postCampaign(req: Request, res: Response) {
    const user = await this.getUser(req, ["company"]);
    if (!user) throw new Error("Undefined user");
    const campaignInfo: { campaignTemplateId?: number; withTemplateValues?: boolean; type: CampaignType; name: string; description?: string, perimeterId:number, year: number } = req.body;
    campaignInfo.withTemplateValues = !!campaignInfo.withTemplateValues;
    const perimeter = await validatePerimeter(campaignInfo.perimeterId, user);
    await PerimeterAccessControl.buildFor(user, perimeter).requireManager();
    if (campaignInfo.campaignTemplateId) {
      await validateCampaign(campaignInfo.campaignTemplateId, user!);
    }

    let newCampaign: Campaign;

    try {
      if (!campaignInfo.campaignTemplateId) {
        newCampaign = await campaignManager.createNew(
          { 
            name: campaignInfo.name,
            type: campaignInfo.type,
            year: campaignInfo.year,
            perimeter,
          },
          true
        );
      } else {
        newCampaign = await campaignManager.createFromTemplate({
          campaignTemplateId: campaignInfo.campaignTemplateId,
          withTemplateValues: campaignInfo.withTemplateValues,
          name: campaignInfo.name,
          type: campaignInfo.type,
          year: campaignInfo.year,
          perimeter,
        });
      }
    } catch (error) {
      if (error instanceof CampaignExistsForYearAndTypeError) {
        throw new CustomError({statusCode: 400, message: 'A campaign already exist for this year, type, and perimeter'})
      }
      throw error;
    }

    res.status(201).send(classToPlain(newCampaign));
  }

  @use([
    param("id").exists().toInt(),
    body("name").exists().isString(),
    body("description").custom((value, { req }) => typeOrNull('string', value)),
    body("year").exists().toInt(),
    body("targetYear").custom((value, { req }) => typeOrNull('number', value)),
    body("type")
      .exists().custom((value) => Object.values(CampaignType).includes(value)),
    body("status")
      .exists().custom((value) => Object.values(CampaignStatus).includes(value)),
    expressValidatorThrower,
  ])
  @put("/:id")
  async putCampaign(req: Request, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    if (!user) throw new Error("Undefined user");
    const campaign = await validateCampaign(id, user!);
    const perimeter = await validatePerimeter(campaign.perimeterId, user);

    await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireManager();

    const campaignNewInfo: {
      name: string;
      description: string | null;
      year: number;
      targetYear: number | null;
      type: CampaignType;
      status: CampaignStatus;
    } = req.body;
    const { name, description, year, targetYear, type, status } = campaignNewInfo;

    try {
      await campaignManager.modify({
        perimeter,
        campaign,
        name,
        description,
        year,
        targetYear,
        status,
        type,
      });
    } catch (error) {
      if (error instanceof CampaignExistsForYearAndTypeError) {
        throw new CustomError({statusCode: 400, message: 'A campaign already exist for this year, type, and perimeter'})
      }
      throw error;
    }

    res.status(200).send(classToPlain(campaign));
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @del("/:id")
  async deleteCampaign(req: Request, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const campaign =await validateCampaign(id, user!);

    await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireManager();

    const deleteResult = await this.em
      .getCustomRepository(CampaignRepository)
      .softDelete(id);

    if (!deleteResult.raw.changedRows) {
      throw new NotFoundError();
    }

    res.status(204).send({});
  }

  @use([param("id").exists().toInt(), expressValidatorThrower])
  @get("/:id/csv")
  async getCsvExport(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(id, user!);
    const customLocale = user?.locale ?? undefined;
    await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireCollaborator();

    const exportedEntries = await activityEntryManager
      .getRepository()
      .getCsvExport(campaign.id, customLocale);

    const firstRow = exportedEntries[0];
    const rawCsvColumns = Object.keys(firstRow) as RowCsvColumns[];
    const columns = this.getTranslatedColumns(rawCsvColumns, customLocale);

    const csvRows = this.formatCsvRows(exportedEntries, customLocale);

    const csvRecords = csvStringify([
      columns,
      ...csvRows
    ], {
      delimiter: ';'
    });

    res.attachment(this.getCsvName(campaign.id));
    res.status(200).send(csvRecords);
  }

  /**
   * @request Array of entries (id) typed in string
   * @response
   */
  @use([
    param("id").exists().toInt(),
    body("listEntriesId")
    .exists()
    .custom((value) => Array.isArray(value)),
    expressValidatorThrower,
  ])
  @post("/:id/entries/remove")
  async deleteCampaignEntries(req: CustomRequest, res: Response) {
    const id = (req.params.id as unknown) as number;
    const activityEntriesId = (req.body.listEntriesId as unknown) as Array<number>;
    let arrayEntriesId = activityEntriesId;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(id, user!);
    arrayEntriesId.forEach(async entryId => {
      const activityEntry = await validateActivityEntry(entryId, user!);

      await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireManager();

      if (!activityEntry) {
        throw new NotFoundError();
      }

      await activityEntryManager.del(activityEntry);
    });

    res.status(204).send();
  }

  @use(multipleEntryDataValidator)
  @post("/:id/entries/create-multiple")
  async createMultipleEntries(req: CustomRequest, res: Response) {
    const id = req.params.id as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(id, user!);
    await PerimeterAccessControl.buildFor(
      user,
      campaign.perimeter
    ).requireManager();

    const entriesData = req.body as unknown as EntryData[];

    const activityModels = await getActivityModelsInvolved(entriesData);
    const activities =
      await activityManager.getOrCreateActivityForCampaignAndActivityModelList(
        campaign,
        activityModels
      );
    const activitiesByActivtyModelId = activities.reduce((acc, activity) => {
      acc[activity.activityModel.id] = activity;
      return acc;
    }, {} as Record<number, Activity>);

    await Promise.all(entriesData.map(async entryData => {
      const { activityModelId, computeMethodId, metadata } = entryData;
      const computeMethod =
        computeMethodId != null
          ? await validateComputeMethodForActivityModel(
              activityModelId,
              computeMethodId
            )
          : null;

      const ignoreInput2 = computeMethod?.value2NameContentCode === null;
      
      return activityEntryManager.createNew(
        {
          ...entryData,
          activity: activitiesByActivtyModelId[entryData.activityModelId],
          computeMethod,
          title: null,
          isExcludedFromTrajectory: false,
          status: Status.IN_PROGRESS,
          value2: ignoreInput2 ? null : entryData.value2,
          isImpersonated: this.userIsImpersonated(req),
        },
        entryData.emissionFactorId,
        null,
        entryData.tags,
        metadata,
      );
    }));
    res.status(201).send();
  }


  private getCsvName(campaignId: number): string {
    const date = new Date();

    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_campagne_${campaignId}.csv`
  }

  private getTranslatedColumns(rawCsvColumns: RowCsvColumns[], customLocale?: LOCALE): string[] {
    const locale = customLocale ?? fallbackLocale;
    return rawCsvColumns.reduce((acc, column) => {
      const csvTranslation: any = translations[locale].campaign.csv;
      const columnName = csvTranslation[column];
      if(columnName != null){
        acc.push(columnName);
      }
      return acc;
    }, [] as string[]);
  }

  private formatCsvRows(rawCsvRows: CsvExportResultRow[], customLocale?: LOCALE): any[] {
    const locale = customLocale ?? fallbackLocale;
    const formatValues = (rawCsvRow: CsvExportResultRow): FormattedCsvColumns => {
      const {cm_name, ae_manual_tco2, ae_manual_unit_number, ...restCsvRow} = rawCsvRow;
      const localeTranslations = translations[locale];
      switch (restCsvRow.scope) {
        case SCOPE.UPSTREAM:
          restCsvRow.scope = upperFirst(localeTranslations.global.upstream);
          break;
        case SCOPE.CORE:
          restCsvRow.scope = upperFirst(localeTranslations.global.core);
          break;
        case SCOPE.DOWNSTREAM:
          restCsvRow.scope = upperFirst(localeTranslations.global.downstream);
          break;
      }
      switch (restCsvRow.status) {
        case Status.NEW_ACTIVITY:
          restCsvRow.status = upperFirst(localeTranslations.global.status.new);
          break;
        case Status.IN_PROGRESS:
          restCsvRow.status = upperFirst(localeTranslations.global.status.inProgress);
          break;
        case Status.TERMINATED:
          restCsvRow.status = upperFirst(localeTranslations.global.status.terminated);
          break;
        case Status.TO_VALIDATE:
          restCsvRow.status = upperFirst(localeTranslations.global.status.toValidate);
          break;
        case Status.ARCHIVED:
          restCsvRow.status = upperFirst(localeTranslations.global.status.archived);
          break;
      }
      switch(restCsvRow.cm_type){
        case ComputeMethodType.RAW_DATA:
          restCsvRow.cm_type = localeTranslations.campaign.csv.saisie_donnee_brute;
          restCsvRow.input_name_1 = localeTranslations.campaign.csv.tonnes_CO2_e;
          restCsvRow.input_unit_1 = localeTranslations.campaign.csv.tco2e;
          restCsvRow.input_value_1 = rawCsvRow.ae_manual_tco2;
          restCsvRow.input_name_2 = "";
          restCsvRow.input_unit_2 = "";
          break;
        case ComputeMethodType.CUSTOM_EMISSION_FACTOR:
          restCsvRow.cm_type = localeTranslations.campaign.csv.custom_emission_factor;
          restCsvRow.input_name_1 = rawCsvRow.cef_input_1_name ?? '';
          restCsvRow.input_unit_1 = rawCsvRow.cef_input_1_unit ?? '';
          restCsvRow.ef_name = rawCsvRow.cef_name ?? '';
          restCsvRow.ef_value = rawCsvRow.cef_value ?? 0;
          break;
        case ComputeMethodType.STANDARD:
          restCsvRow.cm_type = rawCsvRow.cm_name;
      }

      restCsvRow.result_tco2 = Math.round(100 * restCsvRow.result_tco2 / 1000) / 100;
      restCsvRow.entry_uncertainty = Math.round(100 * (restCsvRow.entry_uncertainty ?? 0));

      restCsvRow.ae_trajectory_status = restCsvRow.ae_trajectory_status ? upperFirst(localeTranslations.global.no) : upperFirst(localeTranslations.global.yes);

      return restCsvRow;
    };

    const csvRows = rawCsvRows.map((row) => {
      const cleanedRow: any = {
        ...row,
      };
      delete cleanedRow.cef_input_1_name;
      delete cleanedRow.cef_input_1_unit;
      delete cleanedRow.cef_name;
      delete cleanedRow.cef_value;
      return Object.values(formatValues(cleanedRow));
    });

    return csvRows;
  }
}
