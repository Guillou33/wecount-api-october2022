import { ActivityModel } from "@root/entity";
import { activityModelManager } from "@root/manager";

import { EntryData } from "./multipleEntryData";

function getActivityModelsInvolved(
  listOfEntryData: EntryData[]
): Promise<ActivityModel[]> {
  const activityModelIds = listOfEntryData.map(
    entryData => entryData.activityModelId
  );
  return activityModelManager.getRepository().findByIds(activityModelIds);
}

export { getActivityModelsInvolved };
