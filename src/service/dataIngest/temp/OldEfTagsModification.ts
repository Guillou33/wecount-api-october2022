import { EmissionFactorInfoRepository } from "@root/repository";
import { getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  EF_ID = 0,
  EF_NAME = 1,
  T1 = 2,
  T2 = 3,
  T3 = 4,
  T4 = 5,
  T5 = 6,
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
    const foundEfi = await this.em.getCustomRepository(EmissionFactorInfoRepository).findOneByEfId(parseInt(line[CsvLine.EF_ID]));
    if (!foundEfi) {
      throw new Error(`EFI with efId ${line[CsvLine.EF_ID]} does not exist.`);
    }
    foundEfi.tag1 = (line[CsvLine.T1] && line[CsvLine.T1] !== "NULL") ? line[CsvLine.T1] : null;
    foundEfi.tag2 = (line[CsvLine.T2] && line[CsvLine.T2] !== "NULL") ? line[CsvLine.T2] : null;
    foundEfi.tag3 = (line[CsvLine.T3] && line[CsvLine.T3] !== "NULL") ? line[CsvLine.T3] : null;
    foundEfi.tag4 = (line[CsvLine.T4] && line[CsvLine.T4] !== "NULL") ? line[CsvLine.T4] : null;
    this.em.save(foundEfi);
  }
}
