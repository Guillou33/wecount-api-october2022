import { getManager } from "typeorm";
import { emissionFactorManager } from "@root/manager";
import { DbName, ElementType } from "@root/entity/enum/EmissionFactorEnums";

import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  MANUFACTURER = 0,
  NAME = 1,
  CATEGORY = 2,
  SUB_CATEGORY = 3,
  GWP_TOTAL = 4,
  GWP_USE_RATIO = 5,
  YEARLY_TEC = 6,
  LIFETIME = 7,
  USE_LOCATION = 8,
  REPORT_DATE = 9,
  SOURCES = 10,
  GWP_ERROR_RATIO = 11,
  GWP_MANUFACTURING_RATIO = 12,
  WEIGHT = 13,
  ASSEMBLY_LOCATION = 14,
  SCREEN_SIZE = 15,
  SERVER_TYPE = 16,
  HARD_DRIVE = 17,
  MEMORY = 18,
  NUMBER_CPU = 19,
  HEIGHT = 20,
  ADDED_DATE = 21,
  ADD_METHOD = 22,
  GWP_TRANSPORT_RATIO = 23,
  GWP_EOL_RATIO = 24,
}

export default class Modificator extends AbstractBaseIngestor {
  private em;
  private dbId = 0;

  protected csvLength = 24;

  constructor(csvPath: string) {
    super(csvPath);

    this.em = getManager();
  }

  protected formatCsvTypes(value: string, index: number) {
    if (
      [
        CsvLine.GWP_MANUFACTURING_RATIO,
        CsvLine.GWP_TOTAL,
        CsvLine.GWP_USE_RATIO,
      ].includes(index)
    ) {
      return value === "" ? 0 : parseFloat(value);
    }
    return value;
  }

  async ingest(): Promise<void> {
    console.log(this.csvParsed.length);

    for (let i = 0; i < this.csvParsed.length; i++) {
      console.log(i);

      const line = this.csvParsed[i];
      this.checkLength(line);

      const efData = this.getEfData(line);
      if(isNaN(efData.value)){
        continue;
      }
      await emissionFactorManager.create(efData);
      
    }

    console.log("END");
  }

  private getEfData(line: any) {
    const efName = line[CsvLine.MANUFACTURER] + " - " + line[CsvLine.NAME];
    const efSource = line[CsvLine.REPORT_DATE] + " - " + line[CsvLine.SOURCES];
    const efValue =
      line[CsvLine.GWP_MANUFACTURING_RATIO] !== 0
        ? line[CsvLine.GWP_MANUFACTURING_RATIO] * line[CsvLine.GWP_TOTAL]
        : line[CsvLine.GWP_TOTAL] * (1 - line[CsvLine.GWP_USE_RATIO]);

    return {
      value: efValue,
      uncertainty: 30,
      dbName: DbName.BOAVIZTA,
      dbId: this.getNextDbId(),
      elementType: ElementType.ELEMENT,

      name: efName,
      nameEn: efName,

      source: efSource,
      sourceEn: efSource,

      description: "",
      descriptionEn: "",

      unit: "kgCO2e/unité",
      unitEn: "kgCO2e/unit",

      input1Unit: "unité(s)",
      input1UnitEn: "unit(s)",

      input2Unit: "an(s)",
      input2UnitEn: "year(s)",

      program: "",
      programEn: "",

      urlProgram: "",
      urlProgramEn: "",
    };
  }

  private getNextDbId(){
    return this.dbId++;
  }
}
