import { EmissionFactorTag, EmissionFactorTagLabel, EmissionFactorTagLabelRelation } from "@root/entity";
import { LOCALE } from "@root/entity/enum/Locale";
import { contentManager, emissionFactorManager } from "@root/manager";
import { EmissionFactorTagLabelRepository, EmissionFactorTagRepository } from "@root/repository";
import { getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  TEMP_INGESTION_ID = 0,
  TAG_LABEL_ID = 1,
  NAME_FR = 2,
  NAME_EN = 3,
  USELESS = 4,
}

export default class EfTagIngestor extends AbstractBaseIngestor {

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
    const existingEfTag = await this.em.getCustomRepository(EmissionFactorTagRepository).findOne({
      where: {
        tempIngestionId: line[CsvLine.TEMP_INGESTION_ID],
      },
    });

    if (existingEfTag) {
      throw new Error(`EmissionFactorTag with tempIngestionId already exists: ${line[CsvLine.TEMP_INGESTION_ID]}`);
    }

    if (!line[CsvLine.NAME_FR]) {
      throw new Error(`EmissionFactorTag does not have any french name: ${line[CsvLine.TEMP_INGESTION_ID]}`);
    }
    const contentCode = await contentManager.createAndGetContentCode({
      prefix: 'ef_tag',
      text: line[CsvLine.NAME_FR],
      locale: LOCALE.FR_FR,
    });
    await contentManager.addTranslation({
      code: contentCode,
      text: line[CsvLine.NAME_EN] ? line[CsvLine.NAME_EN] : line[CsvLine.NAME_FR],
      locale: LOCALE.EN_GB,
      translationMissing: !line[CsvLine.NAME_EN],
    }, true);

    const efTag = new EmissionFactorTag();
    efTag.tempIngestionId = line[CsvLine.TEMP_INGESTION_ID].trim();
    efTag.nameContentCode = contentCode;
    
    const parentIngestionId = line[CsvLine.TAG_LABEL_ID];
    const formattedParentIngestionId = parentIngestionId.trim();
    const parentEmissionFactorTagLabel = await this.em.getCustomRepository(EmissionFactorTagLabelRepository).findOne({
      tempIngestionId: formattedParentIngestionId,
    });
    if (!parentEmissionFactorTagLabel) {
      throw new Error("Parent EFTL does not exist: " + parentIngestionId);
    }
    if (!parentEmissionFactorTagLabel.isFinal) {
      throw new Error("Parent EFTL is root tag");
    }

    efTag.emissionFactorTagLabel = parentEmissionFactorTagLabel;

    await this.em.save(efTag);
  }
}
