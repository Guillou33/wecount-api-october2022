import { Activity, ActivityEntry, Campaign, Company, Perimeter, EntryTagMapping } from "@entity/index";
import { DEFAULT_UNCERTAINTY } from '@entity/activity/ActivityEntry';
import AbstractManagerWithRepository from "@manager/AbstractManagerWithRepository";
import RequestFiedError from "@deep/responseError/RequestFieldError";
import { CampaignRepository } from "@root/repository/index";
import trajectoryManager from "@manager/trajectory/trajectoryManager"
import { CampaignType } from "@root/entity/enum/CampaignType";
import { CampaignStatus } from "@root/entity/enum/CampaignStatus";
import { Status } from "@root/entity/enum/Status";
import { ASSIGNABLE_PERIMETER_ROLE, toPerimeterRole } from "@root/entity/enum/PerimeterRole";
import { perimeterRoleManager } from "@root/service/core/security/auth/RoleManager";
import { PERIMETER_ROLES } from "@root/service/core/security/auth/config";

export class CampaignExistsForYearAndTypeError extends Error {}

export const campaignNextStatusAuthorization: {
  [status in CampaignStatus]: CampaignStatus[]
} = {
  [CampaignStatus.IN_PREPARATION]: [
    CampaignStatus.IN_PROGRESS,
  ],
  [CampaignStatus.IN_PROGRESS]: [
    CampaignStatus.CLOSED,
  ],
  [CampaignStatus.CLOSED]: [
    CampaignStatus.ARCHIVED,
    CampaignStatus.IN_PROGRESS,
  ],
  [CampaignStatus.ARCHIVED]: [
    CampaignStatus.CLOSED,
    CampaignStatus.IN_PROGRESS,
  ],
};

class CampaignManager extends AbstractManagerWithRepository<Campaign, CampaignRepository> {
  protected entityClass = Campaign;
  protected repositoryClass = CampaignRepository;

  async createNew(
    campaignInfo: { name: string; description?: string; perimeter: Perimeter, year: number, type: CampaignType },
    flush: boolean = false
  ): Promise<Campaign> {
    const campaign = this.instance();
    campaign.perimeter = campaignInfo.perimeter;
    campaign.name = campaignInfo.name;
    campaign.type = campaignInfo.type;
    campaign.status = CampaignStatus.IN_PREPARATION;
    campaign.year = campaignInfo.year;
    if (campaignInfo.description) {
      campaign.description = campaignInfo.description;
    }

    if (flush) {
      await this.em.save(campaign);
    }

    return campaign;
  }

  async createFromTemplate({
    campaignTemplateId,
    withTemplateValues,
    type,
    name,
    year,
    perimeter,
  }: {
    campaignTemplateId: number,
    withTemplateValues: boolean,
    type: CampaignType,
    name: string,
    year: number,
    perimeter: Perimeter,
  }) : Promise<Campaign> {
    const campaignFull = await this.getRepository().findFullWithoutTrajectory(campaignTemplateId);
    if (!campaignFull) {
      throw new Error("Campaign does not exist");
    }

    const existingCampaignForTypeAndYear = await this.getRepository().existingActiveCampaignForTypeAndYear({
      type,
      year,
      perimeter,
    });
    if (existingCampaignForTypeAndYear) {
      throw new CampaignExistsForYearAndTypeError();
    }

    const newCampaign = new Campaign();

    Object.assign(newCampaign, campaignFull);
    // @ts-ignore
    newCampaign.id = undefined;
    // @ts-ignore
    newCampaign.createdAt = undefined;
    // @ts-ignore
    newCampaign.updatedAt = undefined;
    newCampaign.type = type;
    newCampaign.year = year;
    newCampaign.name = name;
    newCampaign.status = CampaignStatus.IN_PREPARATION;
    if (!withTemplateValues) {
      newCampaign.resultTco2Core = 0;
      newCampaign.resultTco2Upstream = 0;
      newCampaign.resultTco2Downstream = 0;
      newCampaign.uncertaintyCore = 0;
      newCampaign.uncertaintyUpstream = 0;
      newCampaign.uncertaintyDownstream = 0;

      newCampaign.resultTco2CoreForTrajectory = 0;
      newCampaign.resultTco2UpstreamForTrajectory = 0;
      newCampaign.resultTco2DownstreamForTrajectory = 0;
      newCampaign.uncertaintyCoreForTrajectory = 0;
      newCampaign.uncertaintyUpstreamForTrajectory = 0;
      newCampaign.uncertaintyDownstreamForTrajectory = 0;
    }

    const activitiesToDuplicate = [...newCampaign.activities];
    newCampaign.activities = [];

    await this.em.save(newCampaign);
    
    const activitySavePromises: Promise<any>[] = [];
    activitiesToDuplicate.forEach((newActivity) => {
      activitySavePromises.push(this.saveDuplicatedActivity(newActivity, newCampaign, withTemplateValues));
    });

    await Promise.all([...activitySavePromises]);

    return newCampaign;
  }

  async modify({
    perimeter,
    campaign,
    name,
    description,
    year,
    targetYear,
    status,
    type,
  }: {
    perimeter: Perimeter,
    campaign: Campaign,
    name: string,
    description: string | null,
    year: number,
    targetYear: number | null,
    status: CampaignStatus,
    type: CampaignType,
  }) : Promise<Campaign> {
    if (campaign.year !== year || campaign.status !== status) {
      const existingCampaignForTypeAndYear = await this.getRepository().existingActiveCampaignForTypeAndYear({
        currentId: campaign.id,
        type: campaign.type,
        year,
        perimeter,
      });
      if (existingCampaignForTypeAndYear) {
        throw new CampaignExistsForYearAndTypeError();
      }
    }
    this.em.merge(Campaign, campaign, {
      name,
      description,
      year,
      targetYear,
      status,
      type,
    });
    await this.em.save(campaign);

    return campaign;
  }

  private async saveDuplicatedActivity(activity: Activity, newCampaign: Campaign, withValues: boolean) {
    const newActivity = new Activity();

    Object.assign(newActivity, activity);
    // @ts-ignore
    newActivity.id = undefined;
    // @ts-ignore
    newActivity.createdAt = undefined;
    // @ts-ignore
    newActivity.updatedAt = undefined;
    newActivity.campaign = newCampaign;
    newActivity.status = Status.IN_PROGRESS;
    if (!withValues) {
      newActivity.resultTco2 = null;
      newActivity.uncertainty = null;
    }

    const entriesToDuplicate = [...newActivity.activityEntries];

    newActivity.activityEntries = [];

    await this.em.save(newActivity);

    const entrySavePromises: Promise<ActivityEntry>[] = [];

    entriesToDuplicate.forEach(async (activityEntry) => {
      const newActivityEntry = new ActivityEntry();
      Object.assign(newActivityEntry, activityEntry);
      // @ts-ignore
      newActivityEntry.id = undefined;
      // @ts-ignore
      newActivityEntry.createdAt = undefined;
      // @ts-ignore
      newActivityEntry.updatedAt = undefined;
      newActivityEntry.dataSource = null;
      newActivityEntry.description = null;
      newActivityEntry.status = Status.IN_PROGRESS;
      newActivityEntry.activity = newActivity;
      newActivityEntry.activityEntryReference = activityEntry.activityEntryReference;
      if (!withValues) {
        newActivityEntry.value = null;
        newActivityEntry.value2 = null;
        newActivityEntry.manualTco2 = null;
        newActivityEntry.manualUnitNumber = null;
        newActivityEntry.resultTco2 = 0;
        newActivityEntry.uncertainty = DEFAULT_UNCERTAINTY;
      }
      
      newActivityEntry.entryTagMappings = activityEntry.entryTagMappings.map(tagMapping => {
        const newEntryTagMapping = this.em.create(EntryTagMapping, {
          entryTag: tagMapping.entryTag,
        });
        return newEntryTagMapping;
      })
      
      entrySavePromises.push(this.em.save(newActivityEntry));
    });
    
    const savedEntries = await Promise.all(entrySavePromises);
    const saveTagEntriesPromises: Promise<EntryTagMapping>[] = [];
    savedEntries.forEach(entry => entry.entryTagMappings.forEach(tagMapping => {
      tagMapping.activityEntry = entry;
      saveTagEntriesPromises.push(this.em.save(tagMapping));
    }))
    await Promise.all(saveTagEntriesPromises);
  }

  canAccessCampaign(status: CampaignStatus, role: ASSIGNABLE_PERIMETER_ROLE) {
    if (perimeterRoleManager.isGranted({ roles: [toPerimeterRole(role)] }, PERIMETER_ROLES.PERIMETER_MANAGER)) {
      return true;
    }
    if (perimeterRoleManager.isGranted({ roles: [toPerimeterRole(role)] }, PERIMETER_ROLES.PERIMETER_COLLABORATOR)) {
      return status !== CampaignStatus.IN_PREPARATION;
    }
    return status !== CampaignStatus.IN_PREPARATION && status !== CampaignStatus.CLOSED;
  }

}

export default new CampaignManager();
