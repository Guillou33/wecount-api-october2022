import BaseEventEmitter from "@event/emitter/BaseEventEmitter";
import { Activity } from "@root/entity";

export enum EventNames {
  ACTIVITY_DELETED = "ACTIVITY_DELETED",
  ACTIVITY_UPDATED = "ACTIVITY_UPDATED",
};

export interface ActivityDeletedEvent {
  name: EventNames.ACTIVITY_DELETED
  payload: {
    campaignId: number
  } 
}
export interface ActivityUpdatedEvent {
  name: EventNames.ACTIVITY_UPDATED
  payload: {
    activity: Activity
  } 
}

type Events = ActivityDeletedEvent | ActivityUpdatedEvent;
class ActivityEventEmitter extends BaseEventEmitter<Events> {}

export default new ActivityEventEmitter();