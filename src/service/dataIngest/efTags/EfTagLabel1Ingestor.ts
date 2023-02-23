import { EmissionFactorTagLabel, EmissionFactorTagLabelMapping } from "@root/entity";
import { LOCALE } from "@root/entity/enum/Locale";
import { computeMethodManager, contentManager, emissionFactorManager } from "@root/manager";
import { EmissionFactorTagLabelRepository } from "@root/repository";
import { getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  TEMP_INGESTION_ID = 0,
  NAME_FR = 1,
  NAME_EN = 2,
  CM_IDS = 3,
}

export default class EfTagLabel1Ingestor extends AbstractBaseIngestor {

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

      await this.handleEfTagLabel(line);
    }

    console.log('END');
  }

  private async handleEfTagLabel(line: string[]) {
    const existingEfTagLabel = await this.em.getCustomRepository(EmissionFactorTagLabelRepository).findOne({
      where: {
        tempIngestionId: line[CsvLine.TEMP_INGESTION_ID],
      },
    });

    if (existingEfTagLabel) {
      throw new Error(`EmissionFactorTagLabel with tempIngestionId already exists: ${line[CsvLine.TEMP_INGESTION_ID]}`);
    }

    if (!line[CsvLine.NAME_FR]) {
      throw new Error(`EmissionFactorTagLabel does not have any french name: ${line[CsvLine.TEMP_INGESTION_ID]}`);
    }
    const contentCode = await contentManager.createAndGetContentCode({
      prefix: 'ef_tag_label',
      text: line[CsvLine.NAME_FR],
      locale: LOCALE.FR_FR,
    });
    await contentManager.addTranslation({
      code: contentCode,
      text: line[CsvLine.NAME_EN] ? line[CsvLine.NAME_EN] : line[CsvLine.NAME_FR],
      locale: LOCALE.EN_GB,
      translationMissing: !line[CsvLine.NAME_EN],
    }, true);

    const efTagLabel = new EmissionFactorTagLabel();
    efTagLabel.tempIngestionId = line[CsvLine.TEMP_INGESTION_ID].trim();
    efTagLabel.nameContentCode = contentCode;
    efTagLabel.isRoot = true;
    efTagLabel.isFinal = false;

    await this.em.save(efTagLabel);

    const eftlMappingsToSave: EmissionFactorTagLabelMapping[] = [];
    const cmIds = line[CsvLine.CM_IDS].split(',');
    for (const cmId of cmIds) {
      const formattedCmId = parseInt(cmId.trim());
      if (isNaN(formattedCmId)) {
        continue;
      }
      const computeMethod = await computeMethodManager.getRepository().findOne(formattedCmId);
      if (!computeMethod) {
        throw new Error("CM does not exist: " + cmId);
      }
      const eftlMapping = new EmissionFactorTagLabelMapping();
      eftlMapping.computeMethod = computeMethod;
      eftlMapping.emissionFactorTagLabel = efTagLabel;
      eftlMappingsToSave.push(eftlMapping);
    }
    await this.em.save(eftlMappingsToSave);
  }
}
