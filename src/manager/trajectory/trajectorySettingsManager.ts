import AbstractManager from "@manager/AbstractManager";
import { SCOPE } from "@entity/enum/Scope";
import { NotFoundError } from "@root/service/core/error/response";

import { TrajectorySettings, Perimeter } from "@entity/index";
import { ScopeTargetRepository } from "@repository/index";

type ScopeTargetData = {
  target: number | null;
  description: string | null;
};

class TrajectorySettingsManager extends AbstractManager<TrajectorySettings> {
  protected entityClass = TrajectorySettings;

  async createNew(perimeter: Perimeter): Promise<TrajectorySettings> {
    const trajectorySettings = this.em.create(TrajectorySettings, {
      perimeter,
    });
    await this.em.save(trajectorySettings);
    trajectorySettings.scopeTargets = await this.em
      .getCustomRepository(ScopeTargetRepository)
      .initScopeTargets(trajectorySettings);

    return trajectorySettings;
  }

  async updateScopeTarget(
    scope: SCOPE,
    trajectorySettings: TrajectorySettings,
    data: ScopeTargetData
  ): Promise<TrajectorySettings> {
    let scopeTargetToUpdate = trajectorySettings.scopeTargets.find(
      scopeTarget => scopeTarget.scope === scope.toUpperCase()
    );
    if (scopeTargetToUpdate == null) {
      throw new NotFoundError();
    }
    scopeTargetToUpdate.target = data.target ?? null;
    scopeTargetToUpdate.description = data.description ?? null;
    await this.em.save(scopeTargetToUpdate);
    return trajectorySettings;
  }

  async updateTargetYear(
    trajectorySettings: TrajectorySettings,
    targetYear: number
  ): Promise<TrajectorySettings> {
    trajectorySettings.targetYear = targetYear;
    return this.em.save(trajectorySettings);
  }
}

export default new TrajectorySettingsManager();
