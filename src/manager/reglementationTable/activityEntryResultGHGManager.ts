import AbstractActivityEntryResultManager, {
  GetFreshInstanceArgs,
} from "@root/manager/reglementationTable/AbstractActivityEntryResultManager";
import {
  ActivityEntryResultGHG,
  EmissionFactorInfo,
  EmissionFactor,
} from "@root/entity";
import { ReglementationTableCode } from "@root/entity/enum/ReglementationTableCode";

class ActivityEntryResultGHGManager extends AbstractActivityEntryResultManager<ActivityEntryResultGHG> {
  protected entityClass = ActivityEntryResultGHG;
  protected tableCode = ReglementationTableCode.GHG;

  protected getFreshInstance(args: GetFreshInstanceArgs) {
    return this.instanceFromData(args);
  }

  protected initInstanceSpecificData(instance: ActivityEntryResultGHG): void {
    instance.hfcs = 0;
    instance.pfcs = 0;
    instance.sf6 = 0;
    instance.co2b = 0;
  }

  protected async setSpecificGases(
    instance: ActivityEntryResultGHG,
    emissionFactor: EmissionFactor,
    emissionFactorInfo: EmissionFactorInfo | undefined
  ): Promise<void> {
    const { cO2b } = emissionFactorInfo ?? {};
    instance.co2b = (instance.result * (cO2b ?? 0)) / emissionFactor.value;
  }
}

export default new ActivityEntryResultGHGManager();
