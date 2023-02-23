import {
  Activity,
  Campaign,
  ActivityModel,
  ActivityEntry,
} from "@entity/index";
import AbstractManagerWithRepositoty from "@root/manager/AbstractManagerWithRepository";
import { ActivityRepository } from "@repository/index";
import { Status } from "@entity/enum/Status";
import activityEventEmitter, {
  EventNames,
  ActivityUpdatedEvent,
  ActivityDeletedEvent,
} from "@event/emitter/activity/ActivityEventEmitter";
import { activityEntryManager, userManager } from "@manager/index";
import getStatusFromEntries from "@service/utils/getStatusFromEntries";

class ActivityManager extends AbstractManagerWithRepositoty<
  Activity,
  ActivityRepository
> {
  protected entityClass = Activity;
  protected repositoryClass = ActivityRepository;

  async createNew(
    data: {
      campaign: Campaign;
      activityModel: ActivityModel;
      title?: string;
      description?: string;
      status: Status;
      reductionIdea?: string;
      reductionTarget?: number;
    },
    flush: boolean = false
  ): Promise<Activity> {
    const activity = this.instanceFromData(data);

    if (flush) {
      await this.em.save(activity);
    }

    return activity;
  }

  async update(
    activity: Activity,
    data: {
      title: string;
      description: string | null;
      status: Status;
      reductionIdea: string | null;
      reductionTarget: number | null;
    },
    joins: {
      ownerId: number | null;
    }
  ): Promise<void> {
    this.em.merge(Activity, activity, data);

    await this.em.save(activity);
    activityEventEmitter.emit<ActivityUpdatedEvent>({
      name: EventNames.ACTIVITY_UPDATED,
      payload: {
        activity,
      },
    });
  }

  async del(activity: Activity) {
    const campaign = activity.campaign;
    if (!campaign) {
      throw new Error(
        "To delete an activity, you must provide id with its campaign"
      );
    }

    await this.getRepository().softDelete(activity.id);

    activityEventEmitter.emit<ActivityDeletedEvent>({
      name: EventNames.ACTIVITY_DELETED,
      payload: {
        campaignId: campaign.id,
      },
    });
  }

  async updateTotal(
    activity: Activity,
    flush: boolean = false
  ): Promise<Activity> {
    const activityEntries = await this.em.find(ActivityEntry, {
      where: {
        activity,
      },
      join: {
        alias: "ae",
        leftJoinAndSelect: {
          emissionFactor: "ae.emissionFactor",
        },
      },
    });

    const total = activityEntries.reduce((total, entry) => {
      total += entry.resultTco2;
      return total;
    }, 0);

    const uncertainty =
      total === 0
        ? 0
        : activityEntries.reduce((uncertainty, entry) => {
            const entryComputedUncertainty =
              activityEntryManager.getComputedUncertainty(entry);
            uncertainty +=
              (entryComputedUncertainty * entry.resultTco2) / total;
            return uncertainty;
          }, 0);

    activity.resultTco2 = total;
    activity.uncertainty = uncertainty;

    if (flush) {
      await this.em.save(activity);
    }

    return activity;
  }

  async updateStatus(
    activity: Activity,
    flush: boolean = false
  ): Promise<Activity> {
    const activityEntries = await this.em.find(ActivityEntry, {
      where: { activity },
    });
    const newStatus = getStatusFromEntries(activityEntries);
    activity.status = newStatus;

    if (flush) {
      await this.em.save(activity);
    }
    return activity;
  }

  async findAllActivityWithEntriesForCampaign(campaign: Campaign): Promise<Activity[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder("a")
      .select(["a.id", "am.id", "site.id", "product.id"])
      .leftJoinAndSelect("a.activityEntries", "entry")
      .leftJoinAndSelect("entry.computeMethod", "computeMethod")
      .leftJoinAndSelect("entry.emissionFactor", "emissionFactor")
      .leftJoin("entry.site", "site")
      .leftJoin("entry.product", "product")
      .leftJoin("a.activityModel", "am")
      .where("a.campaign=:campaignId", { campaignId: campaign.id })
      .andWhere("entry.soft_deleted_at IS NULL")
      .orderBy("entry.created_at", "DESC");

    return queryBuilder.getMany();
  }

  async findActivityByCampaignAndActivityModel(
    campaign: Campaign,
    activityModel: ActivityModel
  ): Promise<Activity | undefined> {
    return this.getRepository().findOne(
      {
        campaign,
        activityModel,
      },
      { relations: ["activityModel"] }
    );
  }

  async getOrCreateActivityForCampaignAndActivityModel(
    campaign: Campaign,
    activityModel: ActivityModel
  ): Promise<Activity> {
    const activity = await this.findActivityByCampaignAndActivityModel(
      campaign,
      activityModel
    );
    if (!activity) {
      return this.createNew(
        { campaign, activityModel, status: Status.IN_PROGRESS },
        true
      );
    }
    return activity;
  }

  async getOrCreateActivityForCampaignAndActivityModelList(
    campaign: Campaign,
    activityModels: ActivityModel[]
  ): Promise<Activity[]> {
    const uniqueActivityModels = activityModels.reduce((acc, activityModel) => {
      acc[activityModel.id] = activityModel;
      return acc;
    }, {} as Record<number, ActivityModel>);

    return Promise.all(
      Object.values(uniqueActivityModels).map(activityModel =>
        this.getOrCreateActivityForCampaignAndActivityModel(
          campaign,
          activityModel
        )
      )
    );
  }
}

export default new ActivityManager();
