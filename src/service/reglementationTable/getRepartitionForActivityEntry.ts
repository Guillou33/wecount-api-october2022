import { ActivityEntry } from "@root/entity";

import { ReglementationTableCode } from "@root/entity/enum/ReglementationTableCode";

import {
  computeMethodRepartitionManager,
  activityModelRepartitionManager,
  computeMethodRepartitionExceptionManager,
} from "@root/manager";

export type RepartitionBySubCategoryId = {
  [subCategoryId: number]: { ratio: number }[];
};

export type TableCode = "ISO" | "BEGES" | "GHG";

function groupRepartitionBySubCategoryId(
  repartitions: { reglementationSubCategoryId: number; ratio: number }[]
): RepartitionBySubCategoryId {
  return repartitions.reduce((acc, repartition) => {
    const { reglementationSubCategoryId, ratio } = repartition;
    if (acc[reglementationSubCategoryId] == null) {
      acc[reglementationSubCategoryId] = [];
    }
    acc[reglementationSubCategoryId].push({ ratio });
    return acc;
  }, {} as RepartitionBySubCategoryId);
}

async function getComputeMethodRepartition(
  computeMethodId: number,
  tableCode: ReglementationTableCode
): Promise<RepartitionBySubCategoryId> {
  const repartitions =
    await computeMethodRepartitionManager.findForComputeMethodAndTable(
      computeMethodId,
      tableCode
    );
  return groupRepartitionBySubCategoryId(repartitions);
}

async function getActivityModelRepartition(
  activityModelId: number,
  tableCode: ReglementationTableCode
): Promise<RepartitionBySubCategoryId> {
  const repartitions =
    await await activityModelRepartitionManager.findForActivityModelAndTable(
      activityModelId,
      tableCode
    );
  return groupRepartitionBySubCategoryId(repartitions);
}

async function getRepartitionForActivityEntry(
  entry: ActivityEntry,
  tableCode: ReglementationTableCode
): Promise<RepartitionBySubCategoryId> {
  if (entry.computeMethodId == null) {
    return getActivityModelRepartition(
      entry.activity.activityModel.id,
      tableCode
    );
  }
  const computeMethodRepartitions = await getComputeMethodRepartition(
    entry.computeMethodId,
    tableCode
  );
  if (Object.values(computeMethodRepartitions).length > 0) {
    return computeMethodRepartitions;
  }

  if (entry.emissionFactor != null) {
    const exceptionRepartitions =
      await computeMethodRepartitionExceptionManager.getRepartition(
        entry.computeMethodId,
        entry.emissionFactor,
        tableCode
      );
    return groupRepartitionBySubCategoryId(exceptionRepartitions);
  }

  return [];
}

export default getRepartitionForActivityEntry;
