import { ActivityModel, EmissionFactorMapping } from "@root/entity";
import { DbName } from "@root/entity/enum/EmissionFactorEnums";
import { activityCategoryManager, activityModelManager, contentManager, emissionFactorManager } from "@root/manager";
import parse from "csv-parse";
import fs from "fs";
import { DeepPartial, getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  ACTIVITY_MODEL_ID = 0,
  UNIQUE_NAME = 1,
  ARCHIVED = 2,
  PRIVATE = 3,
  VISIBLE_BY_DEFAULT = 4,
  NAME = 5,
  DESCRIPTION = 6,
  ACTIVITY_CATEGORY_ID = 7,
}

export default class Modificator extends AbstractBaseIngestor {

  private amRepository;
  private acRepository;
  private em;

  constructor(csvPath: string) {
    super(csvPath);

    this.amRepository = activityModelManager.getRepository();
    this.acRepository = activityCategoryManager.getRepository();
    this.em = getManager();
  }

  protected csvLength = 8
  protected formatCsvTypes(value: string, index: number) {
    if ([CsvLine.ACTIVITY_MODEL_ID, CsvLine.ACTIVITY_CATEGORY_ID].includes(index)) {
      return value ? parseInt(value.replace(",", ".")) : undefined;
    }
    if ([CsvLine.PRIVATE].includes(index)) {
      return value.toLowerCase().indexOf('oui') !== -1 || value === "1";
    }
    if ([CsvLine.VISIBLE_BY_DEFAULT].includes(index)) {
      return value.toLowerCase().indexOf('non') === -1;
    }
    if ([CsvLine.ARCHIVED].includes(index)) {
      return value.toLowerCase().indexOf('archiv') !== -1;
    }
    return value;
  } 

  async ingest(): Promise<void> {
    console.log(this.csvParsed.length);

    for (let i = 0; i < this.csvParsed.length; i++) {
      console.log(i);
      
      const line = this.csvParsed[i];
      this.checkLength(line);

      if (line[CsvLine.UNIQUE_NAME]) {
        await this.modifyActivityModel(line);
      } else {
        await this.createActivityModel(line);
      }
    }

    console.log('END');
  }

  private async modifyActivityModel(line: any) {
    const am = await this.amRepository.findOneOrFail(line[CsvLine.ACTIVITY_MODEL_ID], {
      join: {
        alias: "am",
        innerJoinAndSelect: {
          activityCategory: "am.activityCategory",
        },
      }
    });

    contentManager.getRepository().removeContentByCodes([am.nameContentCode, am.descriptionContentCode]);
    const nameContentCode = await contentManager.createAndGetContentCode({
      prefix: 'activity_model_name',
      text: line[CsvLine.NAME],
    });
    const descriptionContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'activity_model_description',
      text: line[CsvLine.DESCRIPTION],
    });

    const dataToMerge: DeepPartial<ActivityModel> = {
      archivedDate: line[CsvLine.ARCHIVED] ? new Date() : null,
      isPrivate: line[CsvLine.PRIVATE],
      visibleByDefault: line[CsvLine.VISIBLE_BY_DEFAULT],
      nameContentCode,
      descriptionContentCode,
    };

    if (line[CsvLine.ACTIVITY_CATEGORY_ID] !== am.activityCategory.id) {
      const ac = await this.acRepository.findOneOrFail(line[CsvLine.ACTIVITY_CATEGORY_ID]);
      dataToMerge.activityCategory = ac;
    }

    this.em.merge(ActivityModel, am, dataToMerge);
    this.em.save(am);
  }

  private async createActivityModel(line: any) {

    let activityCategory = await this.acRepository.findOne({
      ingestionTempId: line[CsvLine.ACTIVITY_CATEGORY_ID],
    });
    if (activityCategory == null) {
      activityCategory = await this.acRepository.findOneOrFail(
        line[CsvLine.ACTIVITY_CATEGORY_ID]
      );
    }
    activityModelManager.createNew({
      activityCategory,
      archivedDate: line[CsvLine.ARCHIVED] ? new Date() : null,
      isPrivate: line[CsvLine.PRIVATE],
      visibleByDefault: line[CsvLine.VISIBLE_BY_DEFAULT],
      name: line[CsvLine.NAME],
      description: line[CsvLine.DESCRIPTION],
      ingestionTempId: line[CsvLine.ACTIVITY_MODEL_ID],
    }, true);
  }
}
