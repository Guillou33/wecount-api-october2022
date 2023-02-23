import { computeMethodRepartitionManager } from "@root/manager";
import { DeepPartial, getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";
import {
  ComputeMethod,
  ReglementationSubCategory,
  ComputeMethodReglementationRepartition,
} from "@root/entity";

export enum CsvLine {
  COMPUTE_METHOD_ID = 0,
  REGLEMENTATION_SUB_CATEGORY = 1,
  RATIO = 2,
}

export default class Modificator extends AbstractBaseIngestor {
  private em;

  constructor(csvPath: string) {
    super(csvPath);

    this.em = getManager();
  }

  protected csvLength = 3;
  protected formatCsvTypes(value: string, index: number) {
    if (index === CsvLine.COMPUTE_METHOD_ID) {
      return parseInt(value);
    }
    if (index === CsvLine.REGLEMENTATION_SUB_CATEGORY) {
      const parsed = parseInt(value);
      if (isNaN(parsed)) {
        return value;
      }
      return parsed;
    }
    if (index === CsvLine.RATIO) {
      if (value === "") {
        return 1;
      }
      return parseFloat(value);
    }
    return value;
  }

  async ingest(): Promise<void> {
    console.log(this.csvParsed.length);

    for (let i = 0; i < this.csvParsed.length; i++) {
      console.log(i);
      const line = this.csvParsed[i];
      this.checkLength(line);

      const computeMethod = await this.em
        .getRepository(ComputeMethod)
        .findOneOrFail(line[CsvLine.COMPUTE_METHOD_ID]);

      const reglementationSubCategory =
        await this.findReglementationSubCategory(
          line[CsvLine.REGLEMENTATION_SUB_CATEGORY]
        );

      const existingRepartition = await this.em.findOne(
        ComputeMethodReglementationRepartition,
        { computeMethod, reglementationSubCategory }
      );

      if (existingRepartition) {
        if (existingRepartition.ratio !== line[CsvLine.RATIO]) {
          existingRepartition.ratio = line[CsvLine.RATIO];
          await this.em.save(existingRepartition);
        }
      } else {
        await computeMethodRepartitionManager.createNew(
          {
            computeMethod,
            reglementationSubCategory,
            ratio: line[CsvLine.RATIO],
          },
          true
        );
      }
    }

    console.log("END");
  }

  private async findReglementationSubCategory(
    subCategoryIdentifier: string | number
  ): Promise<ReglementationSubCategory> {
    if (typeof subCategoryIdentifier === "number") {
      return this.em.findOneOrFail(
        ReglementationSubCategory,
        subCategoryIdentifier
      );
    }
    return this.em.findOneOrFail(ReglementationSubCategory, {
      code: subCategoryIdentifier,
    });
  }
}
