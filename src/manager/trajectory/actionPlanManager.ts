import AbstractManagerWithRepository from "@manager/AbstractManagerWithRepository";
import {
  ActionPlan,
  CampaignTrajectory,
  PossibleAction,
  ActivityCategory,
  ActivityModel,
} from "@entity/index";
import { ActionPlanRepository } from "@repository/index";

type ActionPlanData = {
  reduction: number | null;
  description: string | null;
  comments: string | null;
};

class ActionPlanManager extends AbstractManagerWithRepository<
  ActionPlan,
  ActionPlanRepository
> {
  protected entityClass = ActionPlan;
  protected repositoryClass = ActionPlanRepository;

  async createNew(
    trajectory: CampaignTrajectory,
    category: ActivityCategory,
    action: PossibleAction | null,
    activityModel: ActivityModel | null,
    data: ActionPlanData,
  ): Promise<ActionPlan> {
    const actionPlan = this.instanceFromData({
      campaignTrajectory: trajectory,
      category,
      action,
      activityModel,
      ...data,
    });

    return this.em.save(actionPlan);
  }

  async update(
    actionPlan: ActionPlan,
    action: PossibleAction | null,
    data: ActionPlan
  ): Promise<ActionPlan> {
    actionPlan.action = action;
    actionPlan.reduction = data.reduction;
    actionPlan.comments = data.comments;
    actionPlan.description = data.description;

    return this.em.save(actionPlan);
  }

  async duplicatedActionPlan(
    actionPlan: ActionPlan,
    trajectory: CampaignTrajectory,
    withValues: boolean
  ): Promise<ActionPlan> {
    const fullActionPlan = await this.em.findOne(ActionPlan, actionPlan.id, {
      relations: ["category", "action"],
    });

    const newActionPlan = this.instanceFromData({
      ...fullActionPlan,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      campaignTrajectory: trajectory,
    });

    if (!withValues) {
      newActionPlan.reduction = null;
    }

    return this.em.save(newActionPlan);
  }
}

export default new ActionPlanManager();
