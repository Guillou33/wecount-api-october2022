import { ActivityModel, EmissionFactorMapping } from "@root/entity";
import { DbName } from "@root/entity/enum/EmissionFactorEnums";
import { contentManager, emissionFactorManager } from "@root/manager";
import parse from "csv-parse";
import fs from "fs";
import { getManager } from "typeorm";

const CSV_LENGTH = 8;
export enum CsvLine {
  ACTIVITY_MODEL_ID = 0,
  USELESS_1 = 1,
  USELESS_2 = 2,
  USELESS_3 = 3,
  EF_DB_NAME = 4,
  EF_DB_ID = 5,
  RECOMMENDED = 6,
  LABEL = 7,
}

export default class Ingestor {
  private csvParsed: any[];

  constructor(private csvPath: string) {}

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
              if ([CsvLine.ACTIVITY_MODEL_ID].includes(context.index)) {
                return value ? parseInt(value.replace(",", ".")) : undefined;
              }
              if ([CsvLine.RECOMMENDED].includes(context.index)) {
                return !!parseInt(value);
              }
              if ([CsvLine.EF_DB_NAME].includes(context.index)) {
                return value === "Ademe" ? DbName.ADEME : DbName.WECOUNT;
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

    const efRepository = emissionFactorManager.getRepository();
    const em = getManager();

    const activityModelLabelsTreated: number[] = [];
    for (let i = 0; i < this.csvParsed.length; i++) {
      // console.log(`EFM #${i}`);

      const line = this.csvParsed[i];

      this.checkLength(line);

      try {
        const ef = await efRepository.findOneOrFail({
          dbId: line[CsvLine.EF_DB_ID],
          dbName: line[CsvLine.EF_DB_NAME],
        });
        const activityModel = await em.findOneOrFail(
          ActivityModel,
          line[CsvLine.ACTIVITY_MODEL_ID],
          {
            join: {
              alias: "am",
              leftJoinAndSelect: {
                profile: "am.computeMethods",
              },
            },
          }
        );
        const cm = activityModel.computeMethods[0];
  
        // TODO THOMAS adapt
        // const efm = new EmissionFactorMapping();
        // efm.emissionFactor = ef;
        // efm.computeMethod = cm;
        // efm.recommended = line[CsvLine.RECOMMENDED];
  
        // await em.save(efm);
  
        if (activityModelLabelsTreated.indexOf(line[CsvLine.ACTIVITY_MODEL_ID]) === -1) {
          activityModelLabelsTreated.push(line[CsvLine.ACTIVITY_MODEL_ID]);
          await contentManager.getRepository().removeContentByCode(cm.emissionFactorLabelContentCode);
          const emissionFactorLabelContentCode = await contentManager.createAndGetNullableContentCode({
            prefix: 'cm_emission_factor_label',
            text: line[CsvLine.LABEL],
          });
          cm.emissionFactorLabelContentCode = emissionFactorLabelContentCode;
          await em.save(cm);
        }
      } catch (error) {
        console.log('ERROR', error);
      }
      
    }
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
