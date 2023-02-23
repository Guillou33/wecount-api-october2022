import { ActivityEntry } from "@root/entity";
import { ComputeMethodType } from "@root/entity/enum/ComputeMethodType";
import { Status } from "@root/entity/enum/Status";

export type ActivtyEntrydata = {
  computeMethodType: ComputeMethodType;
  title: string | null;
  manualTco2: number | null | undefined;
  manualUnitNumber: number | null | undefined;
  uncertainty: number;
  resultTco2: number | undefined;
  value: number | null;
  value2: number | null;
  description: string | null;
  dataSource: string | null;
  siteId: number | null | undefined;
  productId: number | null | undefined;
  emissionFactorId: number;
  status: Status;
};

export enum ActivityEntryUpdates {
  SITE,
  PRODUCT,
  EMISSION_FACTOR,
  STATUS,
  OTHER,
}

export function getActivityEntryUpdates(
  activityEntry: ActivityEntry,
  activityEntryData: ActivtyEntrydata
): ActivityEntryUpdates[] {
  let updates: ActivityEntryUpdates[] = [];
  if (activityEntry.siteId !== activityEntryData.siteId) {
    updates.push(ActivityEntryUpdates.SITE);
  }
  if (activityEntry.productId !== activityEntryData.productId) {
    updates.push(ActivityEntryUpdates.PRODUCT);
  }
  if (activityEntry.status !== activityEntryData.status) {
    updates.push(ActivityEntryUpdates.STATUS);
  }
  if (activityEntry.emissionFactorId !== activityEntryData.emissionFactorId) {
    updates.push(ActivityEntryUpdates.EMISSION_FACTOR);
  }
  return updates;
}
