import AbstractActivityEntryResultManager, {
  GetFreshInstanceArgs,
} from "@root/manager/reglementationTable/AbstractActivityEntryResultManager";
import {
  ActivityEntryResultBEGES,
  EmissionFactorInfo,
  EmissionFactor,
} from "@root/entity";
import { ReglementationTableCode } from "@root/entity/enum/ReglementationTableCode";

class ActivityEntryResultBEGESManager extends AbstractActivityEntryResultManager<ActivityEntryResultBEGES> {
  protected entityClass = ActivityEntryResultBEGES;
  protected tableCode = ReglementationTableCode.BEGES;

  protected getFreshInstance(args: GetFreshInstanceArgs) {
    return this.instanceFromData(args);
  }

  protected initInstanceSpecificData(instance: ActivityEntryResultBEGES): void {
    instance.co2b = 0;
  }

  protected async setSpecificGases(
    instance: ActivityEntryResultBEGES,
    emissionFactor: EmissionFactor,
    emissionFactorInfo: EmissionFactorInfo | undefined
  ): Promise<void> {
    const { cO2b } = emissionFactorInfo ?? {};
    instance.co2b = (instance.result * (cO2b ?? 0)) / emissionFactor.value;
  }
}

export default new ActivityEntryResultBEGESManager();
