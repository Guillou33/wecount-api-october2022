import { ActivityModel, ComputeMethod } from "@root/entity";
import { ComputeMode } from "@root/entity/enum/ComputeMode";
import { computeMethodManager, activityModelManager, contentManager } from "@root/manager";
import { DeepPartial, getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  COMPUTE_METHOD_ID = 0,
  NAME = 1,
  POSITION = 2,
  BY_DEFAULT = 3,
  ACTIVITY_MODEL_ID = 4,
  SPECIAL_COMPUTE_MODE = 5,
  VALUE_NAME = 6,
  VALUE2_NAME = 7,
  EMISSION_FACTOR_LABEL = 8,
  ARCHIVED = 9,
}

export default class Modificator extends AbstractBaseIngestor {

  private cmRepository;
  private amRepository;
  private em;

  constructor(csvPath: string) {
    super(csvPath);

    this.amRepository = activityModelManager.getRepository();
    this.cmRepository = computeMethodManager.getRepository();
    this.em = getManager();
  }

  protected csvLength = 8
  protected formatCsvTypes(value: string, index: number) {
    if ([CsvLine.COMPUTE_METHOD_ID, CsvLine.ACTIVITY_MODEL_ID].includes(index)) {
      return value ? parseInt(value.replace(",", ".")) : undefined;
    }
    if ([CsvLine.BY_DEFAULT].includes(index)) {
      return !!parseInt(value);
    }
    if ([CsvLine.SPECIAL_COMPUTE_MODE].includes(index)) {
      const valueTyped = value;
      const valueFilled = (valueTyped === "" ? null : valueTyped) as unknown as (ComputeMode | null);
      return valueFilled
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

      const existingCm = await this.cmRepository.findOne(line[CsvLine.COMPUTE_METHOD_ID]);

      if (existingCm) {
        await this.modifyComputeMethod(line, existingCm);
      } else {
        await this.createComputeMethod(line);
      }
    }

    console.log('END');
  }

  private async modifyComputeMethod(line: any, existingCm: ComputeMethod) {
    
    contentManager.getRepository().removeContentByCodes([existingCm.nameContentCode, existingCm.valueNameContentCode, existingCm.value2NameContentCode, existingCm.emissionFactorLabelContentCode]);
    
    const nameContentCode = await contentManager.createAndGetContentCode({
      prefix: 'cm_name',
      text: line[CsvLine.NAME],
    });
    const valueNameContentCode = await contentManager.createAndGetContentCode({
      prefix: 'cm_value_name',
      text: line[CsvLine.VALUE_NAME],
    });
    const value2NameContentCode = await contentManager.createAndGetContentCode({
      prefix: 'cm_value_2_name',
      text: line[CsvLine.VALUE2_NAME],
    });
    const emissionFactorLabelContentCode = await contentManager.createAndGetContentCode({
      prefix: 'cm_emission_factor_label',
      text: line[CsvLine.EMISSION_FACTOR_LABEL],
    });
    const dataToMerge: DeepPartial<ComputeMethod> = {
      nameContentCode,
      position: line[CsvLine.POSITION],
      specialComputeMode: line[CsvLine.SPECIAL_COMPUTE_MODE],
      valueNameContentCode,
      value2NameContentCode,
      emissionFactorLabelContentCode,
      archivedDate: line[CsvLine.ARCHIVED] ? new Date() : null,
      isDefault: line[CsvLine.BY_DEFAULT],
    };

    this.em.merge(ComputeMethod, existingCm, dataToMerge);
    this.em.save(existingCm);
  }

  private async createComputeMethod(line: any) {
    let am = await this.amRepository.findOne({
      ingestionTempId: line[CsvLine.ACTIVITY_MODEL_ID]
    });
    if (!am) {
      am = await this.amRepository.findOneOrFail(line[CsvLine.ACTIVITY_MODEL_ID]);
    }
    
    computeMethodManager.createNew({
      activityModel: am,
      name: line[CsvLine.NAME],
      specialComputeMode: line[CsvLine.SPECIAL_COMPUTE_MODE],
      valueName: line[CsvLine.VALUE_NAME],
      value2Name: line[CsvLine.VALUE2_NAME],
      emissionFactorLabel: line[CsvLine.EMISSION_FACTOR_LABEL],
      archivedDate: line[CsvLine.ARCHIVED] ? new Date() : null,
      isDefault: line[CsvLine.BY_DEFAULT],
      position: line[CsvLine.POSITION],
      ingestionTempId: line[CsvLine.COMPUTE_METHOD_ID],
    }, true);
  }
}
