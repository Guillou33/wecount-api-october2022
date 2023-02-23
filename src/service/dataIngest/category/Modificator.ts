import { ActivityCategory } from "@root/entity";
import { activityCategoryManager, contentManager } from "@root/manager";
import { DeepPartial, getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";
import { SCOPE } from "@root/entity/enum/Scope";

export enum CsvLine {
  CATEGORY_ID = 0,
  CREATION_DATE = 1,
  SCOPE = 2,
  NAME = 3,
  ICON_NAME = 4,
  DESCRIPTION = 5,
  ACTION_PLAN_HELP_URL = 6,
  ORDER = 7,
}

export default class Modificator extends AbstractBaseIngestor {
  private acRepository;
  private em;

  constructor(csvPath: string) {
    super(csvPath);

    this.acRepository = activityCategoryManager.getRepository();
    this.em = getManager();
  }

  protected csvLength = 8;
  protected formatCsvTypes(value: string, index: number) {
    if (index === CsvLine.CATEGORY_ID) {
      return parseInt(value);
    }
    if (index === CsvLine.SCOPE) {
      return this.parseScope(value);
    }
    if (index === CsvLine.ORDER) {
      if (value === "") {
        return 0;
      }
      return parseInt(value);
    }
    return value;
  }

  private parseScope(value: string): SCOPE | undefined {
    if (value === "UPSTREAM") {
      return SCOPE.UPSTREAM;
    }
    if (value === "CORE") {
      return SCOPE.CORE;
    }
    if (value === "DOWNSTREAM") {
      return SCOPE.DOWNSTREAM;
    }
    return undefined;
  }

  async ingest(): Promise<void> {
    console.log(this.csvParsed.length);

    for (let i = 0; i < this.csvParsed.length; i++) {
      console.log(i);
      const line = this.csvParsed[i];
      this.checkLength(line);

      const existingCategory = await this.acRepository.findOne(
        line[CsvLine.CATEGORY_ID]
      );

      if (existingCategory != null) {
        this.updateCategory(line, existingCategory);
      } else {
        this.createCategory(line);
      }
    }

    console.log("END");
  }

  private async updateCategory(
    line: any,
    existingCategory: ActivityCategory
  ): Promise<void> {
    contentManager.getRepository().removeContentByCodes([existingCategory.nameContentCode, existingCategory.descriptionContentCode, existingCategory.actionPlanHelpContentCode]);

    const nameContentCode = await contentManager.createAndGetContentCode({
      prefix: 'activity_category_name',
      text: line[CsvLine.NAME],
    });
    const descriptionContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'activity_category_description',
      text: line[CsvLine.DESCRIPTION],
    });
    const actionPlanHelpContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'activity_category_action_plan_help',
      text: line[CsvLine.ACTION_PLAN_HELP_URL],
    });
    const dataToMerge: DeepPartial<ActivityCategory> = {
      scope: line[CsvLine.SCOPE],
      nameContentCode,
      iconName: line[CsvLine.ICON_NAME],
      descriptionContentCode,
      actionPlanHelpContentCode,
      order: line[CsvLine.ORDER],
    };

    this.em.merge(ActivityCategory, existingCategory, dataToMerge);
    this.em.save(existingCategory);
  }

  private async createCategory(line: any): Promise<void> {
    activityCategoryManager.createNew(
      {
        name: line[CsvLine.NAME],
        scope: line[CsvLine.SCOPE],
        description: line[CsvLine.DESCRIPTION],
        iconName: line[CsvLine.ICON_NAME],
        actionPlanHelp: line[CsvLine.ACTION_PLAN_HELP_URL],
        order: line[CsvLine.ORDER],
        ingestionTempId: line[CsvLine.CATEGORY_ID],
      },
      true
    );
  }
}
