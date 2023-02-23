import activityEntryEventEmitter, {
  ActivityEntryUpdatedEvent,
  ActivityEntryDeletedEvent,
  EventNames as ActivityEntryEventNames,
} from "@event/emitter/activity/ActivityEntryEventEmitter";
import {
  activityEntryResultISOManager,
  activityEntryResultBEGESManager,
  activityEntryResultGHGManager,
} from "@root/manager";
import { ActivityEntry } from "@entity/index";

class ReglementationTableSubscriber {
  constructor() {
    activityEntryEventEmitter.on<ActivityEntryUpdatedEvent>(
      ActivityEntryEventNames.ACTIVITY_ENTRY_UPDATED,
      this.onUpdatedActivityEntry
    );
    activityEntryEventEmitter.on<ActivityEntryDeletedEvent>(
      ActivityEntryEventNames.ACTIVITY_ENTRY_DELETED,
      this.onDeleteActivityEntry
    );
  }

  onUpdatedActivityEntry = async ({
    activityEntry,
  }: {
    activityEntry: ActivityEntry;
  }) => {
    activityEntryResultISOManager.saveOrUpdateResult(activityEntry);
    activityEntryResultBEGESManager.saveOrUpdateResult(activityEntry);
    activityEntryResultGHGManager.saveOrUpdateResult(activityEntry);
  };

  onDeleteActivityEntry = async ({ entryId }: { entryId: number }) => {
    activityEntryResultISOManager.archiveResultsOfEntry(entryId);
    activityEntryResultGHGManager.archiveResultsOfEntry(entryId);
    activityEntryResultBEGESManager.archiveResultsOfEntry(entryId);
  };
}

export const reglementationTableSubscriber =
  new ReglementationTableSubscriber();
