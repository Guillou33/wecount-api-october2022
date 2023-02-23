import { EmissionFactor, EmissionFactorInfo } from "@root/entity";
import { DbName } from "@root/entity/enum/EmissionFactorEnums";
import { emissionFactorManager } from "@root/manager";
import { classToPlain, plainToClass } from "class-transformer";
import parse from "csv-parse";
import fs from "fs";
import { ElementType } from "@root/entity/enum/EmissionFactorEnums";
import CsvToEfMapper from "./CsvToEfMapper";

// import {
//   AttrDef,
//   DataComputeMethod as ComputeMethod,
//   DataActivity as Activity,
//   DataCategory as Category,
//   ActivityDataToIngest as ActivityData,
//   FormatterInterface,
// } from "@root/service/dataIngest/activity/AbstractIngestor";

const CSV_LENGTH = 77;
export enum CsvLine {
  LINE_TYPE = 0,
  ELEMENT_ID = 1,
  OLD_WECOUNT_IDS = 2,
  OLD_FES_ID = 3,
  STRUCTURE = 4,
  ELEMENT_TYPE = 5,
  ELEMENT_STATUS = 6,
  FRENCH_BASE_NAME = 7,
  ENGLISH_BASE_NAME = 8,
  SPANISH_BASE_NAME = 9,
  FRENCH_ATTRIBUTE_NAME = 10,
  ENGLISH_ATTRIBUTE_NAME = 11,
  SPANISH_ATTRIBUTE_NAME = 12,
  FRENCH_BORDER_NAME = 13,
  ENGLISH_BORDER_NAME = 14,
  SPANISH_BORDER_NAME = 15,
  CATEGORY_CODE = 16,
  FRENCH_TAGS = 17,
  ENGLISH_TAGS = 18,
  SPANISH_TAGS = 19,
  FRENCH_UNIT = 20,
  ENGLISH_UNIT = 21,
  SPANISH_UNIT = 22,
  CONTRIBUTOR = 23,
  OTHER_CONTRIBUTORS = 24,
  PROGRAM = 25,
  PROGRAM_URL = 26,
  SOURCE = 27,
  GEOGRAPHIC_LOCALIZATION = 28,
  GEOGRAPHIC_SUB_LOCALIZATION_FRENCH = 29,
  GEOGRAPHIC_SUB_LOCALIZATION_ENGLISH = 30,
  GEOGRAPHIC_SUB_LOCALIZATION_SPANISH = 31,
  CREATION_DATE = 32,
  MODIFICATION_DATE = 33,
  VALIDITY_PERIOD = 34,
  UNCERTAINTY = 35,
  REGULATIONS = 36,
  TRANSPARENCY = 37,
  QUALITY = 38,
  QUALITY_TER = 39,
  QUALITY_GR = 40,
  QUALITY_TIR = 41,
  QUALITY_C = 42,
  QUALITY_P = 43,
  QUALITY_M = 44,
  COMMENT_FRENCH = 45,
  COMMENT_ENGLISH = 46,
  COMMENT_SPANISH = 47,
  POST_TYPE = 48,
  POST_NAME_FRENCH = 49,
  POST_NAME_ENGLISH = 50,
  POST_NAME_SPANISH = 51,
  POST_TOTAL_NOT_DECOMPOSED = 52,
  CO2F = 53,
  CH4F = 54,
  CH4B = 55,
  N2O = 56,
  CODE_GAZ_SUPPLEMENTAIRE_1 = 57,
  VALEUR_GAZ_SUPPLEMENTAIRE_1 = 58,
  CODE_GAZ_SUPPLEMENTAIRE_2 = 59,
  VALEUR_GAZ_SUPPLEMENTAIRE_2 = 60,
  CODE_GAZ_SUPPLEMENTAIRE_3 = 61,
  VALEUR_GAZ_SUPPLEMENTAIRE_3 = 62,
  CODE_GAZ_SUPPLEMENTAIRE_4 = 63,
  VALEUR_GAZ_SUPPLEMENTAIRE_4 = 64,
  CODE_GAZ_SUPPLEMENTAIRE_5 = 65,
  VALEUR_GAZ_SUPPLEMENTAIRE_5 = 66,
  AUTRE_GES = 67,
  CO2B = 68,
  WECOUNT_NAME_FRENCH = 69,
  WECOUNT_NAME_ENGLISH = 70,
  UNIT_INPUT_1 = 71,
  UNIT_INPUT_2 = 72,
  WECOUNT_COMMENT = 73,
  TAG_1 = 74,
  TAG_2 = 75,
  TAG_3 = 76,
  TAG_4 = 77,
  WECOUNT_STATUS = 78,
  CONCATENATED_SOURCE = 79,
}

export default class Ingestor {
  private csvParsed: any[];

  constructor(private csvPath: string, private emissionFactorDb: DbName) {}

  read(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.csvPath, "utf8", (err, csvRawContent) => {
        if (err) {
          console.error("error reading File", err);
        }
        parse(
          csvRawContent,
          {
            delimiter: ";",
            from_line: 2,
            cast: (value, context) => {
              if (
                [
                  CsvLine.CO2F,
                  CsvLine.POST_TOTAL_NOT_DECOMPOSED,
                  CsvLine.UNCERTAINTY,
                  CsvLine.CH4F,
                  CsvLine.CH4B,
                  CsvLine.N2O,
                  CsvLine.VALEUR_GAZ_SUPPLEMENTAIRE_1,
                  CsvLine.VALEUR_GAZ_SUPPLEMENTAIRE_2,
                  CsvLine.VALEUR_GAZ_SUPPLEMENTAIRE_3,
                  CsvLine.VALEUR_GAZ_SUPPLEMENTAIRE_4,
                  CsvLine.VALEUR_GAZ_SUPPLEMENTAIRE_5,
                  CsvLine.AUTRE_GES,
                  CsvLine.CO2B,
                ].includes(context.index)
              ) {
                return value ? parseFloat(value.replace(",", ".")) : undefined;
              }
              if (
                [
                  CsvLine.TRANSPARENCY,
                  CsvLine.QUALITY,
                  CsvLine.QUALITY_TER,
                  CsvLine.QUALITY_GR,
                  CsvLine.QUALITY_TIR,
                  CsvLine.QUALITY_C,
                  CsvLine.QUALITY_P,
                  CsvLine.QUALITY_M,
                ].includes(context.index)
              ) {
                return value ? parseInt(value.replace(",", ".")) : undefined;
              }
              if (
                [
                  CsvLine.CREATION_DATE,
                  CsvLine.MODIFICATION_DATE,
                  CsvLine.VALIDITY_PERIOD,
                ].includes(context.index)
              ) {
                return value ? new Date(value) : undefined;
              }
              return value === "" ? undefined : value;
            },
          },
          (err, output) => {
            if (err) {
              console.error("error parsing CSV", err);
            }
            this.csvParsed = output;
            resolve(this.csvParsed);
          }
        );
      });
    });
  }

  async ingest(): Promise<void> {
    console.log(this.csvParsed.length);

    for (let i = 0; i < this.csvParsed.length; i++) {
      console.log(`EF #${i}`);

      const line = this.csvParsed[i];

      this.checkLength(line);

      if (!line[CsvLine.LINE_TYPE]) {
        continue;
      }

      const csvMapper = new CsvToEfMapper();
      const emissionFactorData = csvMapper.map(line, this.emissionFactorDb);

      const emissionFactorInstance = plainToClass(
        EmissionFactor,
        emissionFactorData,
        {
          groups: ["from_ingestor"],
        }
      );

      const {
        name,
        source,
        description,
        unit,
        input1Unit,
        input2Unit,
        program,
        urlProgram,
        nameEn,
        unitEn,
        input1UnitEn,
        input2UnitEn,
        sourceEn,
        descriptionEn,
        programEn,
        urlProgramEn,
      } = emissionFactorData;

      const emissionFactorInfoToSave = plainToClass(
        EmissionFactorInfo,
        emissionFactorData.emissionFactorInfo,
        {
          groups: ["from_ingestor"],
        }
      );

      const emissionFactorToSave = {
        ...emissionFactorInstance,
        emissionFactorInfo: emissionFactorInfoToSave,
        name,
        nameEn,
        source,
        sourceEn,
        description,
        descriptionEn,
        unit,
        unitEn,
        input1Unit,
        input1UnitEn,
        input2Unit,
        input2UnitEn,
        urlProgram,
        urlProgramEn,
        program,
        programEn,
      };

      if (emissionFactorToSave.elementType === ElementType.ELEMENT) {
        const existingElement = await emissionFactorManager
          .getRepository()
          .findOne({
            dbId: line[CsvLine.ELEMENT_ID],
            dbName: this.emissionFactorDb,
            elementType: ElementType.ELEMENT,
          });

        if (existingElement != null) {
          if (!existingElement.archived && emissionFactorToSave.archived) {
            await emissionFactorManager.archiveEf(existingElement);
          }
          if (!existingElement.notVisible && emissionFactorToSave.notVisible) {
            await emissionFactorManager.hideEf(existingElement);
          }
        } else {
          await emissionFactorManager.create(emissionFactorToSave);
        }
      } else {
        const existingPoste = await emissionFactorManager
          .getRepository()
          .createQueryBuilder("ef")
          .select()
          .leftJoinAndSelect("ef.emissionFactorInfo", "efi")
          .where(
            "ef.dbName= :dbName AND ef.dbId = :dbId AND ef.elementType = :elementType AND efi.postType = :postType",
            {
              dbName: this.emissionFactorDb,
              dbId: emissionFactorToSave.dbId,
              elementType: ElementType.POSTE,
              postType: emissionFactorInfoToSave.postType,
            }
          )
          .getOne();
        if (!existingPoste) {
          await emissionFactorManager.create(emissionFactorToSave);
        }
      }
    }

    console.log("END");
  }

  private checkLength(line: any[], allowLonger: boolean = true): void {
    if (line.length !== CSV_LENGTH) {
      let isBroken = true;
      if (line.length > CSV_LENGTH) {
        line = line.slice(0, CSV_LENGTH);
        isBroken = false;
      }
      if (isBroken) {
        console.log(
          `line broken : line length is ${line.length} instead of ${CSV_LENGTH}`,
          line
        );
        throw new Error("Incorrect CSV parsing");
      }
    }
  }
}
