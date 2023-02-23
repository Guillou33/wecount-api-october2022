import AbstractManager from "@manager/AbstractManager";

import {
  ComputeMethodException,
  EmissionFactor,
  ReglementationSubCategoryMappingsForExceptions,
} from "@root/entity";
import { ReglementationException } from "@entity/enum/ReglementationException";
import emissionFactorManager from "@root/manager/activity/emissionFactorManager";

import { ReglementationTableCode } from "@entity/enum/ReglementationTableCode";

class ComputeMethodRepartitionExceptionManager extends AbstractManager<ComputeMethodException> {
  protected entityClass = ComputeMethodException;

  private getReglementationSubCategory(
    posteType: string | null,
    mapping: ReglementationSubCategoryMappingsForExceptions
  ): number {
    switch (posteType) {
      case "Amont":
        return mapping.upstreamId;
      case "Combustion à la centrale":
        return mapping.powerPlantCombustionId;
      case "Transport et distribution":
        return mapping.transportAndDistributionId;
      default:
        return mapping.labelNotFoundId;
    }
  }

  async getExceptionForComputeMethodAndTable(
    computeMethodId: number,
    tableCode: ReglementationTableCode
  ) {
    const qb = this.em
      .createQueryBuilder(ComputeMethodException, "cme")
      .leftJoin("cme.computeMethod", "cm")
      .leftJoinAndSelect(
        "cme.reglementationSubCategoryMappingsForExceptions",
        "rscm"
      )
      .where("cm.id = :computeMethodId AND rscm.tableCode = :tableCode", {
        computeMethodId,
        tableCode,
      });
    return qb.getOne();
  }

  async getRepartition(
    computeMethodId: number,
    emissionFactor: EmissionFactor,
    tableCode: ReglementationTableCode
  ) {
    const exception = await this.getExceptionForComputeMethodAndTable(
      computeMethodId,
      tableCode
    );

    if (exception == null) {
      return [];
    }

    if (
      exception.reglementationException ===
        ReglementationException.EXCEPTION_2 &&
      !emissionFactor.isRepartitionedByPosteDecomposition
    ) {
      return [
        {
          ratio: 1,
          reglementationSubCategoryId:
            exception.reglementationSubCategoryMappingsForExceptions
              .defaultSubCategoryId,
        },
      ];
    }

    const decompositions = await emissionFactorManager.getPosteDecomposition(
      emissionFactor
    );
    if (decompositions.length === 0) {
      return [
        {
          ratio: 1,
          reglementationSubCategoryId:
            exception.reglementationSubCategoryMappingsForExceptions
              .labelNotFoundId,
        },
      ];
    }

    const computedExceptionRepartition = decompositions.map(efPoste => {
      const ratio = efPoste.value / emissionFactor.value;
      const reglementationSubCategoryId = this.getReglementationSubCategory(
        efPoste.emissionFactorInfo.postType,
        exception.reglementationSubCategoryMappingsForExceptions
      );

      return { reglementationSubCategoryId, ratio };
    });

    return computedExceptionRepartition;
  }
}

export default new ComputeMethodRepartitionExceptionManager();
