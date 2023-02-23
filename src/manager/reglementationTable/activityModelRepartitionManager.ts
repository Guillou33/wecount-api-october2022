import AbstractManager from "@manager/AbstractManager";

import {
  ActivityModelReglementationRepartition,
  ActivityModel,
  ReglementationSubCategory,
} from "@root/entity";

import { TableCode } from "@root/service/reglementationTable/getRepartitionForActivityEntry";

class ActivityModelRepartitionManager extends AbstractManager<ActivityModelReglementationRepartition> {
  protected entityClass = ActivityModelReglementationRepartition;

  async createNew(
    data: {
      activityModel: ActivityModel;
      reglementationSubCategory: ReglementationSubCategory;
      ratio: number;
    },
    flush: boolean = false
  ) {
    const instance = this.instanceFromData(data);
    if (flush) {
      await this.em.save(instance);
    }
    return instance;
  }

  async findForActivityModelAndTable(
    activityModelId: number,
    tableCode: TableCode
  ): Promise<ActivityModelReglementationRepartition[]> {
    const qb = this.em
      .createQueryBuilder(ActivityModelReglementationRepartition, "amr")
      .leftJoin("amr.reglementationSubCategory", "rsc")
      .leftJoin("amr.activityModel", "am")
      .where("am.id = :activityModelId AND rsc.code LIKE :tableCode", {
        activityModelId,
        tableCode: tableCode + "%",
      });
    return qb.getMany();
  }
}

export default new ActivityModelRepartitionManager();
