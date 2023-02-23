import { Status, STATUS_WEIGHTS } from "@entity/enum/Status";
import { ActivityEntry } from "@entity/index";

export default function getStatusFromEntries(entries: ActivityEntry[]): Status {
  if(entries.length === 0){
    return Status.IN_PROGRESS;
  }
  return entries
    .map(entry => entry.status)
    .reduce((status, entryStatus) => {
      const currentWeight = STATUS_WEIGHTS[status];
      const entryStatusWeight = STATUS_WEIGHTS[entryStatus];
      return entryStatusWeight < currentWeight ? entryStatus : status;
    });
}
