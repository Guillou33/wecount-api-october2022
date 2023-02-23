import { EmissionFactorMapping, EmissionFactorTagLabel, EmissionFactorTagLabelMapping } from "@root/entity";
import { LOCALE } from "@root/entity/enum/Locale";
import { computeMethodManager, contentManager, emissionFactorManager } from "@root/manager";
import { EmissionFactorRepository, EmissionFactorTagLabelRepository } from "@root/repository";
import { getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  TEMP_INGESTION_ID = 0,
  NAME_FR = 1,
  NAME_EN = 2,
  CM_IDS = 3,
}

export default class EfMappingIngestor extends AbstractBaseIngestor {

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

      await this.handleEfMapping(line);
    }

    console.log('END');
  }

  private async handleEfMapping(line: string[]) {
    const emissionFactorTagLabel = await this.em.getCustomRepository(EmissionFactorTagLabelRepository).findOne({
      tempIngestionId: line[CsvLine.TEMP_INGESTION_ID],
    });
    if (!emissionFactorTagLabel) {
      throw new Error(`EmissionFactorTagLabel with tempIngestionId does not exist: ${line[CsvLine.TEMP_INGESTION_ID]}`);
    }

    
    const foundEfs = await this.em.getCustomRepository(EmissionFactorRepository).findByTempTagNames([line[CsvLine.NAME_FR], line[CsvLine.NAME_FR].trim()]);
    for (let i = 0; i < foundEfs.length; i++) {
      const ef = foundEfs[i];
      const recommendedEFs = await this.em.query(/*sql*/`SELECT id FROM emission_factor_mapping_old WHERE emission_factor_id = ${ef.id} AND recommended = 1`);
      const recommended = recommendedEFs.length > 0;

      const efm = new EmissionFactorMapping();
      efm.emissionFactor = ef;
      efm.emissionFactorTagLabel = emissionFactorTagLabel;
      efm.recommended = recommended;

      this.em.save(efm);
    }
  }
}
