import { Response } from "express";
import { get, post, put, del, controller, use } from "@deep/routing/decorators";
import { body, param } from "express-validator";
import typeOrNull from "@service/utils/typeOrNull";
import arrayOfType from "@service/utils/arrayOfType";
import {
  ActivityEntry,
} from "@entity/index";
import expressValidatorThrower from "@service/core/error/middleware/expressValidatorThrower";
import { activityCategoryManager, activityEntryManager, activityManager, activityModelManager, entryTagManager } from "@manager/index";
import CustomRequest from "@service/core/express/CustomRequest";
import BaseController from "@controller/BaseController";
import {
  NotFoundError,
} from "@deep/responseError/index";
import { classToPlain } from "class-transformer";
import { validateActivityEntry } from '@controller/activity/helpers/validateActivityEntry';
import { Status } from '@entity/enum/Status';
import { validateComputeMethodForActivity } from "./helpers/validateComputeMethod";
import { ComputeMethodType } from "@root/entity/enum/ComputeMethodType";
import ActivityEntryEditionAccessControl, {
  ActivityEntryData,
} from "@service/core/security/auth/ActivityEntryEditionAccessControl";
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";
import { validateCampaign } from "../core/helpers/validateCampaign";
import { ActivityModel } from "@entity/index";
import { PERIMETER_ROLES } from "@root/service/core/security/auth/config";
import Analytics from "@root/service/core/analytics/Analytics";
import { validatePerimeter } from "../core/helpers/validatePerimeter";

@controller("/campaigns/:campaignId/activity-entries")
class ActivityEntryController extends BaseController {
  @use([param("campaignId").exists().toInt(), expressValidatorThrower])
  @get("")
  async getActivityEntries(req: CustomRequest, res: Response) {
    const campaignId = (req.params.campaignId as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(campaignId, user!);

    const accessControl = await PerimeterAccessControl.buildFor(
      user,
      campaign.perimeter
    );
    await accessControl.requireContributor();

    const isContributor =
      (await accessControl.userRoleWithinPerimeter) ===
      PERIMETER_ROLES.PERIMETER_CONTRIBUTOR;

    const entries = await activityEntryManager.findEntriesFull({
      campaign,
      whereWriter: isContributor ? user! : undefined,
      customLocale: user?.locale ?? undefined,
    });

    res.send(
      classToPlain(entries, {
        groups: [
          "entry_with_activity",
          "activity_with_activity_model",
          "activity_model_base",
          "with_dbname",
          "with_ef_info",
          "with_gas_detail",
        ],
      })
    );
  }

  @use([
    param("campaignId").exists().toInt(),
    param("activityEntryId").exists().toInt(),
    expressValidatorThrower,
  ])
  @get("/:activityEntryId/reference-history")
  async getActivityEntryReferenceHistory(req: CustomRequest, res: Response) {
    const activityEntryId = (req.params.activityEntryId as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const activityEntry = await validateActivityEntry(activityEntryId, user!);

    const activityEntryReference = activityEntry.activityEntryReference;

    const entries = await activityEntryManager.getRepository().findHistoryForActivityEntryReference({
      activityEntryReferenceId: activityEntryReference.id,
      customLocale: user?.locale ?? undefined,
    });

    res.send(
      classToPlain(entries, {
        groups: [
          "with_campaign_year",
          "with_campaign_status",
        ],
      })
    );
  }

  @use([
    param("campaignId").exists().toInt(),
    body("computeMethodId")
      .exists()
      .custom((value) => typeOrNull("number", value)),
    body("computeMethodType")
      .exists()
      .exists().custom((value) => Object.values(ComputeMethodType).includes(value)),
    body("uncertainty").exists().isFloat(),
    body("manualTco2")
      .optional()
      .custom((value) => typeOrNull("number", value)),
    body("manualUnitNumber")
      .optional()
      .custom((value) => typeOrNull("number", value)),
    body("value")
      .exists()
      .custom((value) => typeOrNull("number", value)),
    body("value2")
      .exists()
      .custom((value) => typeOrNull("number", value)),
    body("title")
      .exists()
      .custom((value) => typeOrNull("string", value)),
    body("description")
      .exists()
      .custom((value) => typeOrNull("string", value)),
    body("isExcludedFromTrajectory")
      .exists()
      .isBoolean(),
    body("dataSource")
      .exists()
      .custom((value) => typeOrNull("string", value)),
    body("siteId")
      .optional(),
    body("productId")
      .optional(),
    body("ownerId")
      .exists()
      .custom(value => typeOrNull("number", value)),
    body("writerId")
      .exists()
      .custom(value => typeOrNull("number", value)),
    body("status").exists().custom((value) => Object.values(Status).includes(value)),
    body("emissionFactorId").exists(),
    body("customEmissionFactorId").optional(),
    body("activityModelId").exists().toInt(),
    body("activityEntryReferenceId")
      .optional()
      .custom((value) => typeOrNull("number", value)),
    body("entryTagIds").exists().custom(value => arrayOfType("number", value)),
    expressValidatorThrower,
  ])
  @post("")
  async postActivityEntry(req: CustomRequest, res: Response) {
    const campaignId = (req.params.campaignId as unknown) as number;
    const { computeMethodId }: { computeMethodId: number | null } = req.body;
    const { activityModelId }: { activityModelId: number } = req.body;
    const { status: entryStatus }: { status: Status } = req.body;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(campaignId, user!);
    const activityModel = await this.em.findOneOrFail(ActivityModel, activityModelId);
    
    await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireManager();

    const perimeter = await validatePerimeter(campaign.perimeterId, user!);

    let activity =
      await activityManager.findActivityByCampaignAndActivityModel(
        campaign,
        activityModel
      );
    if(!activity){
      activity = await activityManager.createNew(
        { campaign, activityModel, status: entryStatus },
        true
      );
    }
    const computeMethod = computeMethodId ? await validateComputeMethodForActivity(activity.id, computeMethodId, user?.locale ?? undefined) : null;

    const {
      computeMethodType,
      title,
      manualTco2,
      manualUnitNumber,
      uncertainty,
      value,
      value2,
      description,
      isExcludedFromTrajectory,
      dataSource,
      siteId,
      productId,
      emissionFactorId,
      customEmissionFactorId,
      activityEntryReferenceId,
      status,
      ownerId,
      writerId,
      entryTagIds,
      instruction=null,
    }: {
      computeMethodType: ComputeMethodType;
      title: string | null;
      manualTco2: number | null | undefined;
      manualUnitNumber: number | null | undefined;
      uncertainty: number;
      value: number | null;
      value2: number | null;
      description: string | null;
      isExcludedFromTrajectory: boolean;
      dataSource: string | null;
      siteId: number | null | undefined;
      productId: number | null | undefined;
      emissionFactorId: number;
      customEmissionFactorId: number | null | undefined;
      activityEntryReferenceId: number | null | undefined;
      status: Status;
      ownerId: number | null;
      writerId: number | null;
      entryTagIds: number[];
      instruction: string | null;
    } = req.body;

    let activityEntry = await activityEntryManager.createNew(
      {
        activity,
        computeMethodType,
        customEmissionFactorId,
        computeMethod,
        title,
        manualTco2,
        manualUnitNumber,
        uncertainty,
        value,
        value2,
        description,
        isExcludedFromTrajectory,
        siteId,
        productId,
        dataSource,
        status,
        ownerId,
        writerId,
        instruction,
        isImpersonated: this.userIsImpersonated(req),
      },
      emissionFactorId,
      activityEntryReferenceId,
    );
    await entryTagManager.assignTagsToActivityEntry(activityEntry, entryTagIds);

    activityEntry = await activityEntryManager.getRepository().findWithFullEF(activityEntry.id, user?.locale ?? undefined) as ActivityEntry;
    
    const activityModelWithCategory = await activityModelManager.getRepository().findOneWithCategory(activityModelId, user?.locale ?? undefined);
    const translatedAmWithCateg = classToPlain(activityModelWithCategory, {
      groups: ['activity_model_with_category', 'activity_model_base']
    });

    const analyticsEntryCreated = new Analytics(`entry_created_${translatedAmWithCateg.activityCategory.name.toLowerCase().replace(" ", "_")}_${translatedAmWithCateg.name.toLowerCase().replace(" ", "_")}`);
    analyticsEntryCreated.addAnalytic(user, campaign, perimeter);

    if(description && description !== ""){
      const analyticsDescription = new Analytics(`entry_description`);
      analyticsDescription.addAnalytic(user, campaign, perimeter);
    }
    if(dataSource && dataSource !== ""){
      const analyticsSource = new Analytics(`entry_data_source`);
      analyticsSource.addAnalytic(user, campaign, perimeter);
    }

    if(ownerId){
      const analyticsOwner = new Analytics(`entry_owner`);
      analyticsOwner.addAnalytic(user, campaign, perimeter);
    }
    if(writerId){
      const analyticsWriter = new Analytics(`entry_writer`);
      analyticsWriter.addAnalytic(user, campaign, perimeter);
    }

    res.status(201).send(classToPlain(activityEntry, { groups: ["with_dbname", "with_ef_info", "with_gas_detail"] }));
  }

  @use([
    param("campaignId").exists().toInt(),
    param("activityEntryId").exists().toInt(),
    body("computeMethodType")
      .exists()
      .exists().custom((value) => Object.values(ComputeMethodType).includes(value)),
    body("computeMethodId")
      .exists()
      .custom((value) => typeOrNull("number", value)),
    body("uncertainty").exists().isFloat(),
    body("manualTco2")
      .optional()
      .custom((value) => typeOrNull("number", value)),
    body("manualUnitNumber")
      .optional()
      .custom((value) => typeOrNull("number", value)),
    body("value")
      .exists()
      .custom((value) => typeOrNull("number", value)),
    body("value2")
      .exists()
      .custom((value) => typeOrNull("number", value)),
    body("title")
      .exists()
      .custom((value) => typeOrNull("string", value)),
    body("description")
      .exists()
      .custom((value) => typeOrNull("string", value)),
    body("isExcludedFromTrajectory")
      .exists()
      .isBoolean(),
    body("dataSource")
      .exists()
      .custom((value) => typeOrNull("string", value)),
    body("siteId")
      .optional(),
    body("productId")
      .optional(),
    body("status").exists().custom((value) => Object.values(Status).includes(value)),
    body("ownerId")
      .exists()
      .custom(value => typeOrNull("number", value)),
    body("writerId")
      .exists()
      .custom(value => typeOrNull("number", value)),
    body("emissionFactorId").exists(),
    body("customEmissionFactorId").optional(),
    body("instruction").exists().custom((value) => typeOrNull("string", value)),
    body("entryTagIds").exists().custom(value => arrayOfType("number", value)),
    expressValidatorThrower,
  ])
  @put("/:activityEntryId")
  async putActivity(req: CustomRequest, res: Response) {
    const campaignId = (req.params.campaignId as unknown) as number;
    const activityEntryId = (req.params.activityEntryId as unknown) as number;
    const { computeMethodId }: { computeMethodId: number | null } = req.body;
    const user = await this.getUser(req, ["company"]);
    const campaign = await validateCampaign(campaignId, user!);
    let activityEntry = await validateActivityEntry(activityEntryId, user!);
    const activity = activityEntry.activity;
    const computeMethod = computeMethodId ? await validateComputeMethodForActivity(activity.id, computeMethodId, user?.locale ?? undefined) : null;

    const perimeter = await validatePerimeter(campaign.perimeterId, user!);

    const activityEntryData: ActivityEntryData = req.body;
    const { emissionFactorId, entryTagIds, ...activityEntryDataRest } = activityEntryData;

    const setNewIntruction = (activityEntryData.instruction && (activityEntryData.instruction !== "") && (activityEntryData.instruction !== activityEntry.instruction)) as boolean;
    const setNewDescription = (activityEntryData.description && (activityEntryData.description !== "") && (activityEntryData.description !== activityEntry.description)) as boolean;
    const setNewSource = (activityEntryData.dataSource && (activityEntryData.dataSource !== "") && (activityEntryData.dataSource !== activityEntry.dataSource)) as boolean;

    const setNewOwnerId = (activityEntryData.ownerId && (activityEntryData.ownerId !== activityEntry.ownerId)) as boolean;
    const setNewWriterId = (activityEntryData.writerId && (activityEntryData.writerId !== activityEntry.writerId)) as boolean;

    await ActivityEntryEditionAccessControl.buildFor(user, activityEntry).validateEdition(activityEntryData)
    await activityEntryManager.update(
      activityEntry,
      {
        activity,
        computeMethod,
        ...activityEntryDataRest,
        isImpersonated: this.userIsImpersonated(req),
      },
      emissionFactorId,
    );

    await entryTagManager.assignTagsToActivityEntry(activityEntry, entryTagIds);

    activityEntry = await activityEntryManager.getRepository().findWithFullEF(activityEntry.id, user?.locale ?? undefined) as ActivityEntry;

    if(setNewOwnerId){
      const analyticsOwner = new Analytics(`entry_owner`);
      analyticsOwner.addAnalytic(user, campaign, perimeter);
    }
    if(setNewWriterId){
      const analyticsWriter = new Analytics(`entry_writer`);
      analyticsWriter.addAnalytic(user, campaign, perimeter);
    }

    if(setNewIntruction){
      const analyticsInstruction = new Analytics(`entry_instruction`);
      analyticsInstruction.addAnalytic(user, campaign, perimeter);
    }
    if(setNewDescription){
      const analyticsDescription = new Analytics(`entry_description`);
      analyticsDescription.addAnalytic(user, campaign, perimeter);
    }
    if(setNewSource){
      const analyticsSource = new Analytics(`entry_data_source`);
      analyticsSource.addAnalytic(user, campaign, perimeter);
    }

    res
      .status(200)
      .send(classToPlain(activityEntry, { groups: ["with_dbname", "with_ef_info", "with_gas_detail"] }));
  }

  @use([
    param("campaignId").exists().toInt(),
    param("activityEntryId").exists().toInt(),
    body("computeMethodId")
    .exists()
    .custom((value) => typeOrNull("number", value)),
    expressValidatorThrower,
  ])
  @post("/:activityEntryId/duplicate")
  async copyActivityEntry(req: CustomRequest, res: Response) {
    const campaignId = (req.params.campaignId as unknown) as number;
    const activityEntryId = (req.params.activityEntryId as unknown) as number;
    const { 
      computeMethodId,
    }: { 
      computeMethodId: number | null
    } = req.body;
    const user = await this.getUser(req, ["company"]);

    let activityEntry = await validateActivityEntry(activityEntryId, user!);

    const campaign = await validateCampaign(campaignId, user!);

    const activity = activityEntry.activity;
    const activityId = activity.id;
    
    const computeMethod = computeMethodId ? await validateComputeMethodForActivity(activityId, computeMethodId, user?.locale ?? undefined) : null;

    const newEntry = await activityEntryManager.copy({activityEntry, activity, computeMethod});

    if(!newEntry){
      throw new Error("Entry failed to be duplicated");
    }

    const newEntryFull = (await activityEntryManager.findEntriesFull({
      entryId: newEntry.id,
    }))[0];

    res.send(
      classToPlain(newEntryFull, {
        groups: [
          "entry_with_activity",
          "activity_with_activity_model",
          "activity_model_base",
          "with_dbname",
        ],
      })
    );
  }

  @use([
    param("campaignId").exists().toInt(),
    param("activityEntryId").exists().toInt(),
    expressValidatorThrower,
  ])
  @del("/:activityEntryId")
  async deleteActivity(req: CustomRequest, res: Response) {
    const campaignId = (req.params.campaignId as unknown) as number;
    const activityEntryId = (req.params.activityEntryId as unknown) as number;
    const user = await this.getUser(req, ["company"]);
    const activityEntry = await validateActivityEntry(activityEntryId, user!);
    const campaign = await validateCampaign(campaignId, user!);

    await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireManager();

    if (!activityEntry) {
      throw new NotFoundError();
    }

    await activityEntryManager.del(activityEntry)

    res.status(204).send();
  }

  @use([param("activityEntryId").exists().toInt(), expressValidatorThrower])
  @post("/:activityEntryId/submit-for-validation")
  async submitEntryForValidation(req: CustomRequest, res: Response) {
    const activityEntryId = req.params.activityEntryId as unknown as number;
    const user = await this.getUser(req, ["company"]);
    const activityEntry = await validateActivityEntry(activityEntryId, user!);

    await activityEntryManager.submitForValidation(activityEntry);

    res.send(activityEntry);
  }

  @use([
    param("campaignId").exists().toInt(),
    body("status").exists().custom((value) => Object.values(Status).includes(value)),
    body("list")
    .exists()
    .isArray(),
    expressValidatorThrower,
  ])
  @put("/list/submit")
  async submitList(req: CustomRequest, res: Response){
    const status = req.body.status as Status;
    const list = req.body.list as number[];
    const user = await this.getUser(req, ["company"]);
    const campaignId = (req.params.campaignId as unknown) as number;
    const campaign = await validateCampaign(campaignId, user!);

    await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireManager();

    const entriesId = list.filter(id => !isNaN(id as number));

    const entriesToUpdate = await activityEntryManager.saveMultiple(entriesId, status, user, campaign);
    
    res.send(
      classToPlain(entriesToUpdate, {
        groups: [
          "entry_with_activity",
          "activity_with_activity_model",
          "activity_model_base",
          "with_dbname",
        ],
      })
    );
  }

  @use([
    param("campaignId").exists().toInt(),
    body("list")
    .exists()
    .isArray(),
    expressValidatorThrower,
  ])
  @post("/list/delete")
  async deleteList(req: CustomRequest, res: Response){
    const list = req.body.list as (number | string)[];
    const user = await this.getUser(req, ["company"]);
    const campaignId = (req.params.campaignId as unknown) as number;
    const campaign = await validateCampaign(campaignId, user!);

    await PerimeterAccessControl.buildFor(user, campaign.perimeter).requireManager();

    const entriesId = list.filter(id => !isNaN(parseInt(id as string) as number)).map(id => parseInt(id as string));

    await activityEntryManager.deleteMultiple(entriesId, user);

    res.status(204).send();
  }
}
