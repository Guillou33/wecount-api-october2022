import { activityModelRepartitionManager } from "@root/manager";
import { getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";
import {
  ActivityModel,
  ReglementationSubCategory,
  ActivityModelReglementationRepartition,
} from "@root/entity";

export enum CsvLine {
  ACTIVITY_MODEL_ID = 0,
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
    if (index === CsvLine.ACTIVITY_MODEL_ID) {
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

      const activityModel = await this.em
        .getRepository(ActivityModel)
        .findOneOrFail(line[CsvLine.ACTIVITY_MODEL_ID]);

      const reglementationSubCategory =
        await this.findReglementationSubCategory(
          line[CsvLine.REGLEMENTATION_SUB_CATEGORY]
        );

      const existingRepartition = await this.em.findOne(
        ActivityModelReglementationRepartition,
        { activityModel, reglementationSubCategory }
      );

      if (existingRepartition) {
        if (existingRepartition.ratio !== line[CsvLine.RATIO]) {
          existingRepartition.ratio = line[CsvLine.RATIO];
          await this.em.save(existingRepartition);
        }
      } else {
        await activityModelRepartitionManager.createNew(
          {
            activityModel,
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
