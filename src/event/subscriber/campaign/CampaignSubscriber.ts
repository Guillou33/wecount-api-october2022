import activityEntryEventEmitter, {
  ActivityEntryUpdatedEvent,
  ActivityEntryDeletedEvent,
  EventNames as ActivityEntryEventNames,
} from "@event/emitter/activity/ActivityEntryEventEmitter";
import activityEventEmitter, {
  ActivityDeletedEvent,
  ActivityUpdatedEvent,
  EventNames as ActivityEventNames,
} from "@event/emitter/activity/ActivityEventEmitter";
import { getManager } from "typeorm";
import { CampaignRepository } from "@repository/index";
import { Activity, ActivityEntry, Campaign } from "@entity/index";
import { SCOPE } from "@entity/enum/Scope";

class CampaignSubscriber {
  constructor() {
    activityEntryEventEmitter.on<ActivityEntryUpdatedEvent>(
      ActivityEntryEventNames.ACTIVITY_ENTRY_UPDATED,
      this.onUpdatedActivityEntry
    );
    activityEntryEventEmitter.on<ActivityEntryDeletedEvent>(
      ActivityEntryEventNames.ACTIVITY_ENTRY_DELETED,
      this.onDeletedActivityEntry
    );
    activityEventEmitter.on<ActivityDeletedEvent>(
      ActivityEventNames.ACTIVITY_DELETED,
      this.onDeletedActivity
    );
    activityEventEmitter.on<ActivityUpdatedEvent>(
      ActivityEventNames.ACTIVITY_UPDATED,
      this.onUpdatedActivity
    );
  }

  onUpdatedActivityEntry = async ({
    activityEntry
  }: {
    activityEntry: ActivityEntry;
  }) => {
    const campaign = await getManager().getCustomRepository(CampaignRepository).findOneForActivityEntry(activityEntry.id);
    if (!campaign) {
      throw new Error("Inexistant campaign to update");
    }

    this.recomputeCampaignTotals(campaign.id);
  }

  onDeletedActivityEntry = async ({
    activityId
  }: {
    activityId: number;
  }) => {
    const campaign = await getManager().getCustomRepository(CampaignRepository).findOneForActivity(activityId);
    if (!campaign) {
      throw new Error("Inexistant campaign to update");
    }

    this.recomputeCampaignTotals(campaign.id);
  }

  onDeletedActivity = ({
    campaignId
  }: {
    campaignId: number;
  }) => {
    this.recomputeCampaignTotals(campaignId);
  }

  onUpdatedActivity = async ({
    activity
  }: {
    activity: Activity;
  }) => {
    const campaign = await getManager().getCustomRepository(CampaignRepository).findOneForActivity(activity.id);
    if (!campaign) {
      throw new Error("Inexistant campaign to update");
    }

    this.recomputeCampaignTotals(campaign.id);
  }

  private async recomputeCampaignTotals(campaignId: number) {
    const em = getManager();
    const campaign = await em.findOne(Campaign, campaignId);
    if (!campaign) {
      throw new Error("Campaign is undefined");
    }
    const campaignRepository = em.getCustomRepository(CampaignRepository);
    const totals = await campaignRepository.getTotals(campaignId);
    const totalsForTrajectory = await campaignRepository.getTotalsForTrajectory(campaignId);

    campaign.resultTco2Upstream = totals[SCOPE.UPSTREAM].resultTco2;
    campaign.resultTco2Core = totals[SCOPE.CORE].resultTco2;
    campaign.resultTco2Downstream = totals[SCOPE.DOWNSTREAM].resultTco2;
    campaign.uncertaintyUpstream = totals[SCOPE.UPSTREAM].uncertainty;
    campaign.uncertaintyCore = totals[SCOPE.CORE].uncertainty;
    campaign.uncertaintyDownstream = totals[SCOPE.DOWNSTREAM].uncertainty;

    campaign.resultTco2UpstreamForTrajectory = totalsForTrajectory[SCOPE.UPSTREAM].resultTco2;
    campaign.resultTco2CoreForTrajectory = totalsForTrajectory[SCOPE.CORE].resultTco2;
    campaign.resultTco2DownstreamForTrajectory = totalsForTrajectory[SCOPE.DOWNSTREAM].resultTco2;
    campaign.uncertaintyUpstreamForTrajectory = totalsForTrajectory[SCOPE.UPSTREAM].uncertainty;
    campaign.uncertaintyCoreForTrajectory = totalsForTrajectory[SCOPE.CORE].uncertainty;
    campaign.uncertaintyDownstreamForTrajectory = totalsForTrajectory[SCOPE.DOWNSTREAM].uncertainty;

    em.save(campaign);
  }
}

export const campaignSubscriber = new CampaignSubscriber();
