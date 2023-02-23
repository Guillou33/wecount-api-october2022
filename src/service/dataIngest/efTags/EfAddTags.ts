import { EmissionFactorRepository, EmissionFactorTagRepository } from "@root/repository";
import { lowerCase } from "lodash";
import { getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  TEMP_INGESTION_ID = 0,
  USELESS_1 = 1,
  FR_NAME = 2,
  USELESS_3 = 3,
  DB_NAMES = 4,
}

export default class EfAddTags extends AbstractBaseIngestor {

  private em;

  constructor(csvPath: string) {
    super(csvPath);

    this.em = getManager();
  }

  protected csvLength = 3;
  protected formatCsvTypes(value: string, index: number) {
    return value;
  } 

  async ingest(): Promise<void> {
    console.log(this.csvParsed.length);

    for (let i = 0; i < this.csvParsed.length; i++) {
      console.log(i);
      
      const line = this.csvParsed[i];
      this.checkLength(line);

      await this.handleEfTag(line);
    }

    console.log('END');
  }

  private async handleEfTag(line: string[]) {
    const foundTag = await this.em.getCustomRepository(EmissionFactorTagRepository).findOne({
      tempIngestionId: line[CsvLine.TEMP_INGESTION_ID],
    });
    if (!foundTag) {
      throw new Error(`EmissionFactorTag with tempIngestionId does not exist: ${line[CsvLine.TEMP_INGESTION_ID]}`);
    }
    const dbNames = [...(line[CsvLine.DB_NAMES] ? line[CsvLine.DB_NAMES].split(',') : []), line[CsvLine.FR_NAME]]; 
    const dbNamesTrimmed = dbNames.map(dbName => dbName.trim());
    const foundEfs = await this.em.getCustomRepository(EmissionFactorRepository).findByTempTagNames([...dbNames, ...dbNamesTrimmed]);
    foundEfs.forEach(ef => {
      if (ef.tagIds.includes(foundTag.id)) return;
      ef.tagIds.push(foundTag.id);
    });
    await this.em.save(foundEfs);
  }
}
