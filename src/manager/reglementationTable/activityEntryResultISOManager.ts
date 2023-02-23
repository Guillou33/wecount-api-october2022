import AbstractActivityEntryResultManager, {
  GetFreshInstanceArgs,
} from "@root/manager/reglementationTable/AbstractActivityEntryResultManager";
import { ActivityEntryResultISO, EmissionFactor } from "@root/entity";
import { ReglementationTableCode } from "@root/entity/enum/ReglementationTableCode";

import emissionFactorManager from "@root/manager/activity/emissionFactorManager";

class ActivityEntryResultISOManager extends AbstractActivityEntryResultManager<ActivityEntryResultISO> {
  protected entityClass = ActivityEntryResultISO;
  protected tableCode = ReglementationTableCode.ISO;

  protected getFreshInstance(args: GetFreshInstanceArgs) {
    return this.instanceFromData(args);
  }

  protected initInstanceSpecificData(instance: ActivityEntryResultISO): void {
    instance.co2bCombustion = 0;
    instance.co2bOther = 0;
    instance.fluoredGaz = 0;
  }

  protected async setSpecificGases(
    instance: ActivityEntryResultISO,
    emissionFactor: EmissionFactor
  ): Promise<void> {
    const combustionParts = await emissionFactorManager.getCombustionParts(
      emissionFactor
    );

    instance.co2bCombustion =
      (instance.result * combustionParts.combustionCo2b) / emissionFactor.value;
    instance.co2bOther =
      (instance.result * combustionParts.otherCo2b) / emissionFactor.value;
  }
}

export default new ActivityEntryResultISOManager();
