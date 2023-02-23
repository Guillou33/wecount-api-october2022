import BaseEventEmitter from "@event/emitter/BaseEventEmitter";
import { ActivityEntry } from "@entity/activity/ActivityEntry";

export enum EventNames {
  ACTIVITY_ENTRY_UPDATED = "ACTIVITY_ENTRY_UPDATED",
  ACTIVITY_ENTRY_DELETED = "ACTIVITY_ENTRY_DELETED",
};

export interface ActivityEntryUpdatedEvent {
  name: EventNames.ACTIVITY_ENTRY_UPDATED
  payload: {
    activityEntry: ActivityEntry
  } 
}
export interface ActivityEntryDeletedEvent {
  name: EventNames.ACTIVITY_ENTRY_DELETED
  payload: {
    activityId: number;
    entryId: number;
  }
}

type Events = ActivityEntryUpdatedEvent | ActivityEntryDeletedEvent;
class ActivityEntryEventEmitter extends BaseEventEmitter<Events> {}

export default new ActivityEntryEventEmitter();