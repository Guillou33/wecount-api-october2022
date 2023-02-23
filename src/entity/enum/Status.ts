export enum Status {
  NEW_ACTIVITY = "NEW_ACTIVITY",
  IN_PROGRESS = "IN_PROGRESS",
  TO_VALIDATE = "TO_VALIDATE",
  TERMINATED = "TERMINATED",
  ARCHIVED = "ARCHIVED",
};

type StatusWeights = {
  [key in Status]: number;
}

export const STATUS_WEIGHTS: StatusWeights = {
  [Status.NEW_ACTIVITY]: 0,
  [Status.IN_PROGRESS]: 1,
  [Status.TO_VALIDATE]: 2,
  [Status.TERMINATED]: 3,
  [Status.ARCHIVED]: 4,
}
