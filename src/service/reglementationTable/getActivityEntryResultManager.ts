import { ReglementationTableCode } from "@root/entity/enum/ReglementationTableCode";

import {
  activityEntryResultBEGESManager,
  activityEntryResultISOManager,
  activityEntryResultGHGManager,
} from "@root/manager";

function getActivityEntryResultManager(tableCode: ReglementationTableCode) {
  switch (tableCode) {
    case ReglementationTableCode.ISO:
      return activityEntryResultISOManager;
    case ReglementationTableCode.GHG:
      return activityEntryResultGHGManager;
    case ReglementationTableCode.BEGES:
      return activityEntryResultBEGESManager;
  }
}

export default getActivityEntryResultManager;
