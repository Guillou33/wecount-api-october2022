import { EntityRepository, Repository } from "typeorm";
import { ScopeTarget, TrajectorySettings } from "@entity/index";
import { SCOPE } from "@entity/enum/Scope";

@EntityRepository(ScopeTarget)
export class ScopeTargetRepository extends Repository<ScopeTarget> {
  async initScopeTargets(
    trajectorySettings: TrajectorySettings
  ): Promise<ScopeTarget[]> {
    const scopeCreations = Object.values(SCOPE).map(scope =>
      this.initScopeTarget(trajectorySettings, scope)
    );
    return Promise.all(scopeCreations);
  }

  private initScopeTarget(
    trajectorySettings: TrajectorySettings,
    scope: SCOPE
  ): Promise<ScopeTarget> {
    const scopeTarget = this.create({
      trajectorySettings,
      scope,
    });
    return this.save(scopeTarget);
  }
}
