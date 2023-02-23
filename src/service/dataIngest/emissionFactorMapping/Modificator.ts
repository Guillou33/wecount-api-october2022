import { EmissionFactorMapping } from "@root/entity";
import {
  emissionFactorManager,
  emissionFactorMappingManager,
} from "@root/manager";
import { EmissionFactorTagLabelRepository } from "@root/repository";
import { getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  EMISSION_FACTOR_ID = 0,
  DB_NAME = 1,
  DB_ID = 2,
  RECOMMENDED = 3,
  TAG_LABEL_REAL_ID = 4,
  TAG_LABEL_TEMP_ID = 5,
}

export default class Modificator extends AbstractBaseIngestor {
  private em;
  private efRepository;
  private eftlRepository: EmissionFactorTagLabelRepository;
  private efmRepository;

  constructor(csvPath: string) {
    super(csvPath);

    this.em = getManager();
    this.efRepository = emissionFactorManager.getRepository();
    this.eftlRepository = this.em.getCustomRepository(
      EmissionFactorTagLabelRepository
    );
    this.efmRepository = emissionFactorMappingManager.getRepository();
  }

  protected csvLength = 6;
  protected formatCsvTypes(value: string, index: number) {
    if ([CsvLine.EMISSION_FACTOR_ID].includes(index)) {
      return value ? parseInt(value.replace(",", ".")) : undefined;
    }
    if ([CsvLine.RECOMMENDED].includes(index)) {
      return !!parseInt(value);
    }
    return value;
  }

  async ingest(): Promise<void> {
    console.log(this.csvParsed.length);

    for (let i = 0; i < this.csvParsed.length; i++) {
      const line = this.csvParsed[i];
      this.checkLength(line);
      console.log(i);

      const eftl = await this.findRootTagLabel(line);
      const ef = await this.findEf(line);

      const existingEfm = await this.efmRepository.findOne({
        emissionFactor: ef,
        emissionFactorTagLabel: eftl,
      });

      if (existingEfm == null) {
        const efm = this.em.create(EmissionFactorMapping, {
          emissionFactor: ef,
          emissionFactorTagLabel: eftl,
          recommended: line[CsvLine.RECOMMENDED],
        });
        await this.em.save(efm);
      } else if (existingEfm.recommended !== line[CsvLine.RECOMMENDED]) {
        existingEfm.recommended = line[CsvLine.RECOMMENDED];
        await this.em.save(existingEfm);
      }
    }

    console.log("END");
  }

  private async findEf(line: any) {
    if (line[CsvLine.EMISSION_FACTOR_ID] != null) {
      return this.efRepository.findOneOrFail(line[CsvLine.EMISSION_FACTOR_ID]);
    } else {
      return this.efRepository.findOneOrFail({
        dbName: line[CsvLine.DB_NAME],
        dbId: line[CsvLine.DB_ID],
      });
    }
  }

  private async findRootTagLabel(line: any) {
    const searchIn =
      line[CsvLine.TAG_LABEL_REAL_ID] != null
        ? {
            id: line[CsvLine.TAG_LABEL_REAL_ID],
          }
        : {
            tempIngestionId: line[CsvLine.TAG_LABEL_TEMP_ID],
          };
    return this.eftlRepository.findOneOrFail({ ...searchIn, isRoot: true });
  }
}
