import { EntityRepository, Repository } from "typeorm";
import { ActionPlan } from "@entity/index";

@EntityRepository(ActionPlan)
export class ActionPlanRepository extends Repository<ActionPlan> {
  async removeActionPlan(actionPlan: ActionPlan) {
    return this.softRemove(actionPlan);
  }
}
