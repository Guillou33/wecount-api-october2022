import AbstractManager from "@manager/AbstractManager";

import {
  ComputeMethodReglementationRepartition,
  ComputeMethod,
  ReglementationSubCategory,
} from "@root/entity";

import { TableCode } from "@root/service/reglementationTable/getRepartitionForActivityEntry";

class ComputeMethodRepartitionManager extends AbstractManager<ComputeMethodReglementationRepartition> {
  protected entityClass = ComputeMethodReglementationRepartition;

  async createNew(
    data: {
      computeMethod: ComputeMethod;
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

  async findForComputeMethodAndTable(
    computeMethodId: number,
    tableCode: TableCode
  ): Promise<ComputeMethodReglementationRepartition[]> {
    const qb = this.em
      .createQueryBuilder(ComputeMethodReglementationRepartition, "cmr")
      .leftJoin("cmr.reglementationSubCategory", "rsc")
      .leftJoin("cmr.computeMethod", "cm")
      .where(
        "cm.id = :computeMethodId AND rsc.code LIKE :tableCode",
        { computeMethodId, tableCode: tableCode+"%" }
      );
    return qb.getMany();
  }
}

export default new ComputeMethodRepartitionManager();
