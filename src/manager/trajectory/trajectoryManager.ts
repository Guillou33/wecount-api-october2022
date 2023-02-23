import AbstractManager from "@manager/AbstractManager";
import { CampaignTrajectory, Campaign, ScopeTarget } from "@entity/index";
import { ActionPlanRepository } from "@repository/index";
import actionPlanManager from "@manager/trajectory/actionPlanManager";

type ScopeTargetData = {
  target: number | null;
  description: string | null;
};

class TrajectoryManager extends AbstractManager<CampaignTrajectory> {
  protected entityClass = CampaignTrajectory;

  async createNew(campaign: Campaign): Promise<CampaignTrajectory> {
    const trajectory = this.instanceFromData({ campaign });
    await this.em.save(trajectory);
    const fullTrajectory = await this.em.findOne(
      CampaignTrajectory,
      {
        id: trajectory.id,
      },
      { relations: ["actionPlans"] }
    );
    return fullTrajectory!;
  }

  async removeTrajectory(trajectory: CampaignTrajectory) {
    const actionPlanRepository = this.em.getCustomRepository(
      ActionPlanRepository
    );
    const removeActionPlans = trajectory.actionPlans.map(actionPlan =>
      actionPlanRepository.removeActionPlan(actionPlan)
    );

    await Promise.all([removeActionPlans]);
    await this.em.softRemove(trajectory);
  }

  async duplicatedTrajectory(
    trajectory: CampaignTrajectory,
    campaign: Campaign,
    withValues: boolean
  ) {
    const newTrajectory = this.instanceFromData({ campaign });
    await this.em.save(newTrajectory);

    const fullTrajectory = await this.em.findOne(
      CampaignTrajectory,
      {
        id: trajectory.id,
      },
      { relations: ["actionPlans"] }
    );

    await this.em.save(newTrajectory);

    const actionPlanDuplications = (fullTrajectory?.actionPlans ?? []).map(
      actionPlan =>
        actionPlanManager.duplicatedActionPlan(
          actionPlan,
          newTrajectory,
          withValues
        )
    );

    return [...actionPlanDuplications];
  }

  async duplicatedScopeTargets(
    scopeTarget: ScopeTarget,
    newTrajectory: CampaignTrajectory
  ): Promise<ScopeTarget> {
    const { scope, description, target } = scopeTarget;
    const newScopeTarget = new ScopeTarget();
    
    Object.assign(newScopeTarget, {
      scope,
      description,
      target,
      campaignTrajectory: newTrajectory,
    });

    return this.em.save(newScopeTarget);
  }
}

export default new TrajectoryManager();
