import { Activity, ActivityEntry, ComputeMethod, EmissionFactor, Campaign, User, ActivityEntryReference, ActivityModel, CustomEmissionFactor } from "@entity/index";
import AbstractManagerWithRepository from "@root/manager/AbstractManagerWithRepository";
import { emissionFactorManager, activityManager, activityModelManager, productManager, siteManager, userManager, activityEntryReferenceManager } from "@manager/index";
import { ActivityEntryRepository, addComputeMethodTranslations, addEmissionFactorTranslations } from "@repository/index";
import activityEntryEventEmitter, {
  EventNames,
  ActivityEntryUpdatedEvent,
  ActivityEntryDeletedEvent,
} from "@event/emitter/activity/ActivityEntryEventEmitter";
import { ComputeMode } from "@entity/enum/ComputeMode";
import { Status } from "@entity/enum/Status";
import { ComputeMethodType } from "@root/entity/enum/ComputeMethodType";
import { ElementType } from "@root/entity/enum/EmissionFactorEnums";
import { validateActivityEntry } from "@root/controller/activity/helpers/validateActivityEntry";
import PerimeterAccessControl from "@root/service/core/security/auth/PerimeterAccessControl";
import { NotFoundError } from "@root/service/core/error/response";
import { validatePerimeter } from "@root/controller/core/helpers/validatePerimeter";
import { validateComputeMethodForActivity } from "@root/controller/activity/helpers/validateComputeMethod";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import entryTagManager from "../core/entryTagManager";
import { activityEntryManager } from "@manager/index";
import customEmissionFactorManager from "./customEmissionFactorManager";


class ActivityEntryManager extends AbstractManagerWithRepository<
  ActivityEntry,
  ActivityEntryRepository
> {
  protected entityClass = ActivityEntry;
  protected repositoryClass = ActivityEntryRepository;

  async findEntriesFull({
    campaign,
    whereWriter, 
    entryId,
    customLocale,
  }: {
    campaign?: Campaign,
    whereWriter?: User, 
    entryId?: number,
    customLocale?: LOCALE,
  }): Promise<ActivityEntry[]> {
    const locale = customLocale ?? fallbackLocale;
    const qb = this.getRepository().createQueryBuilder("entry");
    qb.select([
      "entry",
      "activity.id",
      "site.id",
      "product.id",
      "activityModel.id",
      "owner.id",
      "writer.id",
    ])
      .leftJoin("entry.activity", "activity")
      .leftJoin("activity.activityModel", "activityModel")
      .leftJoin("activity.campaign", "campaign")
      .leftJoin("entry.site", "site", "site.archivedDate IS NULL")
      .leftJoin("entry.product", "product", "product.archivedDate IS NULL")
      .leftJoinAndSelect("entry.activityEntryReference", "aer")
      .leftJoin("entry.owner", "owner")
      .leftJoin("entry.writer", "writer")
      .leftJoinAndSelect("entry.computeMethod", "computeMethod")
      .leftJoinAndSelect("entry.customEmissionFactor", "customEmissionFactor");
    addComputeMethodTranslations({
      queryBuilder: qb,
      asName: "computeMethod",
      locale,
    });
    qb.leftJoinAndSelect("entry.emissionFactor", "emissionFactor");
    addEmissionFactorTranslations({
      queryBuilder: qb,
      asName: "emissionFactor",
      locale,
    });
    qb.leftJoinAndSelect("emissionFactor.emissionFactorInfo", "emissionFactorInfo")
      .leftJoinAndSelect("entry.entryTagMappings", "etm")
      .andWhere("entry.soft_deleted_at IS NULL")
      .orderBy("entry.created_at", "DESC")
    
    if(campaign != null){
      qb.andWhere("campaign.id=:id", { id: campaign.id });
    }
    if(whereWriter != null){
      qb.andWhere("entry.writer.id=:writerId", { writerId: whereWriter.id });
    }
    if(entryId != null){
      qb.andWhere("entry.id=:entryId", { entryId });
    }
    return qb.getMany();
  }

  async createNew(
    data: {
      activity: Activity;
      computeMethodType: ComputeMethodType;
      customEmissionFactorId: number | null | undefined;
      computeMethod: ComputeMethod | null;
      title: string | null;
      manualTco2: number | null | undefined;
      manualUnitNumber: number | null | undefined;
      uncertainty: number;
      value: number | null;
      value2: number | null;
      description: string | null;
      isExcludedFromTrajectory: boolean;
      siteId: number | null | undefined;
      productId: number | null | undefined;
      dataSource: string | null;
      status: Status;
      ownerId: number | null | undefined;
      writerId: number | null | undefined;
      instruction: string | null;
      isImpersonated?: boolean,
    },
    emissionFactorId: number | null,
    activityEntryReferenceId?: number | null,
    tags?: number[],
    metadata?: any,
  ): Promise<ActivityEntry> {
    let activityEntry: ActivityEntry;
    
    const product = data.productId != null ? await productManager.getRepository().findOne(data.productId) : null;
    const site = data.siteId != null ? await siteManager.getRepository().findOne(data.siteId) : null;
    const owner = data.ownerId != null ? await userManager.getRepository().findOne(data.ownerId) : null;
    const writer = data.writerId != null ? await userManager.getRepository().findOne(data.writerId) : null;

    delete data.productId;
    delete data.siteId;
    delete data.ownerId;
    delete data.writerId;
    if (data.computeMethodType === ComputeMethodType.DEPRECATE_EMISSION_FACTOR) {
      throw new Error("DEPRECATE_EMISSION_FACTOR is not supported");
    }
    if ([ComputeMethodType.RAW_DATA].indexOf(data.computeMethodType) !== -1) {
      activityEntry = this.instanceFromData({
        ...data,
        manualTco2: data.manualTco2,
        manualUnitNumber: data.manualUnitNumber,
        customEmissionFactor: null,
        customEmissionFactorValue: null,
        resultTco2: (data.manualTco2 ?? 0) * ((data.computeMethodType === ComputeMethodType.RAW_DATA ? 1 : data.manualUnitNumber) ?? 0) * 1000,
        value: null,
        value2: null,
        emissionFactor: null,
        emissionFactorValue: null,
        product,
        site,
        owner,
        writer,
        lastUpdateByAdminImpersonation: data.isImpersonated ?? false
      });
    } else if (data.computeMethodType === ComputeMethodType.CUSTOM_EMISSION_FACTOR) {
      const { cef, resultTco2 } = await this.getCustomEmissionFactorAndResult({
        customEmissionFactorId: data.customEmissionFactorId,
        value: data.value,
      });
      activityEntry = this.instanceFromData({
        ...data,
        manualTco2: null,
        manualUnitNumber: null,
        customEmissionFactor: cef ?? null,
        customEmissionFactorValue: cef?.value,
        value2: null,
        emissionFactor: null,
        emissionFactorValue: null,
        resultTco2,
        product,
        site,
        owner,
        writer,
        lastUpdateByAdminImpersonation: data.isImpersonated ?? false
      });
    } else {
      if (!data.computeMethod) {
        throw new Error("computeMethodType is Standard, but computeMethod is null");
      }
      const { ef, resultTco2 } = await this.getEmissionFactorAndResult({
        activity: data.activity,
        computeMethod: data.computeMethod,
        emissionFactorId,
        value: data.value,
        value2: data.value2,
      });
      activityEntry = this.instanceFromData({
        ...data,
        manualTco2: null,
        manualUnitNumber: null,
        customEmissionFactor: null,
        customEmissionFactorValue: null,
        emissionFactor: ef,
        emissionFactorValue: ef?.value,
        resultTco2,
        product,
        site,
        owner,
        writer,
        metadata,
        lastUpdateByAdminImpersonation: data.isImpersonated ?? false
      });
    }

    let activityEntryReference: ActivityEntryReference;
    if (activityEntryReferenceId) {
      activityEntryReference = await this.em.findOneOrFail(ActivityEntryReference, activityEntryReferenceId);
    } else {
      activityEntryReference = await activityEntryReferenceManager.createNew({
        activityId: data.activity.id,
      });
    }
    activityEntry.activityEntryReference = activityEntryReference;
    await this.em.save(activityEntryReference);

    await this.saveActivityEntry(activityEntry);

    if (tags != null) {
      await entryTagManager.assignTagsToActivityEntry(activityEntry, tags);
    }

    return activityEntry;
  }

  async del(activityEntry: ActivityEntry) {
    const activity = activityEntry.activity;
    if (!activity) {
      throw new Error("You have to pass activity to delete activity entry");
    }
    await this.getRepository().softDelete(activityEntry.id);

    await activityManager.updateTotal(activity);
    await activityManager.updateStatus(activity, true);

    activityEntryEventEmitter.emit<ActivityEntryDeletedEvent>({
      name: EventNames.ACTIVITY_ENTRY_DELETED,
      payload: {
        activityId: activity.id,
        entryId: activityEntry.id,
      },
    });
  }

  async update(
    activityEntry: ActivityEntry,
    data: {
      activity: Activity;
      computeMethodType: ComputeMethodType;
      customEmissionFactorId: number | null | undefined;
      computeMethod: ComputeMethod | null;
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
      status: Status;
      ownerId: number | null | undefined;
      writerId: number | null | undefined;
      isImpersonated?: boolean;
    },
    emissionFactorId: number | null,
  ): Promise<ActivityEntry> {
    const product = data.productId != null ? await productManager.getRepository().findOne(data.productId) : null;
    const site = data.siteId != null ? await siteManager.getRepository().findOne(data.siteId) : null;
    const owner = data.ownerId != null ? await userManager.getRepository().findOne(data.ownerId) : null;
    const writer = data.writerId != null ? await userManager.getRepository().findOne(data.writerId) : null;
    
    delete data.productId;
    delete data.siteId;
    delete data.ownerId;
    delete data.writerId;

    if ([ComputeMethodType.DEPRECATE_EMISSION_FACTOR, ComputeMethodType.RAW_DATA].indexOf(data.computeMethodType) !== -1) {
      this.em.merge(ActivityEntry, activityEntry, {
        ...data,
        manualTco2: data.manualTco2,
        manualUnitNumber: data.manualUnitNumber,
        customEmissionFactor: null,
        customEmissionFactorValue: null,
        resultTco2: (data.manualTco2 ?? 0) * ((data.computeMethodType === ComputeMethodType.RAW_DATA ? 1 : data.manualUnitNumber) ?? 0) * 1000,
        value: null,
        value2: null,
        emissionFactor: null,
        emissionFactorValue: null,
        product,
        site,
        lastUpdateByAdminImpersonation: data.isImpersonated ?? false
      });
    } else if (data.computeMethodType === ComputeMethodType.CUSTOM_EMISSION_FACTOR) {
      const { cef, resultTco2 } = await this.getCustomEmissionFactorAndResult({
        customEmissionFactorId: data.customEmissionFactorId,
        value: data.value,
      });
      this.em.merge(ActivityEntry, activityEntry, {
        ...data,
        manualTco2: null,
        manualUnitNumber: null,
        customEmissionFactor: cef ?? null,
        customEmissionFactorValue: cef?.value,
        value2: null,
        emissionFactor: null,
        emissionFactorValue: null,
        resultTco2,
        product,
        site,
        lastUpdateByAdminImpersonation: data.isImpersonated ?? false
      });
    } else {
      if (!data.computeMethod) {
        throw new Error("computeMethodType is Standard, but computeMethod is null");
      }
      const { ef, resultTco2 } = await this.getEmissionFactorAndResult({
        activity: data.activity,
        computeMethod: data.computeMethod,
        emissionFactorId,
        value: data.value,
        value2: data.value2,
      });
      this.em.merge(ActivityEntry, activityEntry, {
        ...data,
        manualTco2: null,
        manualUnitNumber: null,
        customEmissionFactor: null,
        customEmissionFactorValue: null,
        emissionFactor: ef ?? null,
        emissionFactorValue: ef ? ef.value : null,
        resultTco2,
        product,
        site,
        lastUpdateByAdminImpersonation: data.isImpersonated ?? false
      });
    }

    if (owner !== undefined) {
      activityEntry.owner = owner;
    }
    if (writer !== undefined) {
      activityEntry.writer = writer;
    }
    await this.saveActivityEntry(activityEntry);

    return activityEntry;
  }

  async submitForValidation(entry: ActivityEntry) {
    entry.status = Status.TO_VALIDATE;
    await this.saveActivityEntry(entry);
  }

  async copy({
    activityEntry, 
    activity,
    computeMethod
  }: {
    activityEntry: ActivityEntry;
    activity: Activity;
    computeMethod: ComputeMethod | null;
  }){
    const data = {
      activity: activity,
      computeMethodType: activityEntry.computeMethodType,
      computeMethod: computeMethod,
      customEmissionFactor: activityEntry.customEmissionFactor,
      title: activityEntry.title,
      manualTco2: activityEntry.manualTco2,
      manualUnitNumber: activityEntry.manualUnitNumber,
      uncertainty: activityEntry.uncertainty,
      value: activityEntry.value,
      value2: activityEntry.value2,
      description: activityEntry.description,
      instruction: activityEntry.instruction,
      isExcludedFromTrajectory: activityEntry.isExcludedFromTrajectory,
      dataSource: activityEntry.dataSource,
      siteId: activityEntry.siteId,
      productId: activityEntry.productId,
      status: activityEntry.status,
      ownerId: activityEntry.ownerId,
      writerId: activityEntry.writerId,
    };
    const newActivityEntry = await this.createNew({
      ...data,
      customEmissionFactorId: data.customEmissionFactor?.id,
    }, activityEntry.emissionFactorId);

    await entryTagManager.assignTagsToActivityEntry(
      newActivityEntry,
      activityEntry.entryTagMappings.map(tagMapping => tagMapping.entryTagId)
    );

    return newActivityEntry;
  }

  async saveMultiple(
    list: number[], 
    status: Status, 
    user: User | undefined,
    campaign: Campaign
  ){
    const entriesToUpdate: Promise<ActivityEntry>[] = list.map(async entryKey => {
      let activityEntry = await validateActivityEntry(entryKey, user!);
      
      activityEntry.status = status;

      return this.em.save(activityEntry);
    });

    const entriesUpdated = await Promise.all(entriesToUpdate);

    const allEntries = await this.findEntriesFull({
      campaign
    });

    return allEntries;
  }

  async deleteMultiple(
    list: number[], 
    user: User | undefined,
  ){
    list.map(async entryKey => {
      let activityEntry = await validateActivityEntry(entryKey, user!);
      
      const activity = activityEntry.activity;

      await PerimeterAccessControl.buildFor(user, activity.campaign.perimeter).requireManager();

      if (!activityEntry) {
        throw new NotFoundError();
      }

      await activityEntryManager.del(activityEntry)
    });

  }

  private async saveActivityEntry(activityEntry: ActivityEntry) {
    await this.em.save(activityEntry);
    await activityManager.updateTotal(activityEntry.activity);
    await activityManager.updateStatus(activityEntry.activity, true);
    activityEntryEventEmitter.emit<ActivityEntryUpdatedEvent>({
      name: EventNames.ACTIVITY_ENTRY_UPDATED,
      payload: {
        activityEntry,
      },
    });
  }

  private async getEmissionFactorAndResult({
    activity,
    computeMethod,
    emissionFactorId,
    value,
    value2,
  }: {
    activity: Activity;
    computeMethod: ComputeMethod
    emissionFactorId: number | null;
    value: number | null;
    value2: number | null;
  }): Promise<{
    ef: EmissionFactor | undefined;
    resultTco2: number;
  }> {
    if (!emissionFactorId) {
      return {
        ef: undefined,
        resultTco2: 0,
      }
    }
    
    const ef = await emissionFactorManager.getRepository().findOneOrFail(emissionFactorId);

    let resultTco2: number;
    if (computeMethod.specialComputeMode) {
      resultTco2 = this.computeIfSpecialMode(computeMethod.specialComputeMode, value, value2, ef);
    } else {
      const finalValue = value2 ? (value ?? 0) * (value2 ?? 0) : value ?? 0;
      resultTco2 = finalValue * (ef?.value ?? 0);
    }

    return {
      ef,
      resultTco2,
    };
  }

  private async getCustomEmissionFactorAndResult({
    customEmissionFactorId,
    value,
  }: {
    customEmissionFactorId: number | null | undefined;
    value: number | null;
  }): Promise<{
    cef: CustomEmissionFactor | undefined;
    resultTco2: number;
  }> {
    if (!customEmissionFactorId) {
      return {
        cef: undefined,
        resultTco2: 0,
      }
    }
    
    const cef = await customEmissionFactorManager.getRepository().findOneOrFail(customEmissionFactorId);

    const resultTco2 = (value ?? 0) * cef.value;

    return {
      cef,
      resultTco2,
    };
  }

  public getComputedUncertainty = (activityEntryWithEF: ActivityEntry): number => {
    if (typeof activityEntryWithEF.emissionFactor === "undefined") {
      throw new Error("ActivityEntry has no emission Factor linked. Please Join EF in sql query");
    }
    
    if (!activityEntryWithEF.emissionFactor) {
      return activityEntryWithEF.uncertainty;
    }

    return 1 - ((1 - activityEntryWithEF.uncertainty) * (1 - activityEntryWithEF.emissionFactor.uncertainty / 100));
  }

  private computeIfSpecialMode = (computeMode: ComputeMode, value: number | null, value2: number | null, ef: EmissionFactor | undefined): number => {
    switch (computeMode) {
      case ComputeMode.ACCOUNTING_DEPRECIATION:
        return (value2 ? ((value ?? 0) / value2) : 0) * (ef?.value ?? 0);
    
      default:
        return 0;
    }
  }

  public async revokeOwnershipOfUser(user: User): Promise<void> {
    const qb = this.em
      .createQueryBuilder()
      .update(ActivityEntry)
      .set({ owner: null })
      .where({ owner: user });
    await qb.execute();
  }
}

export default new ActivityEntryManager();
