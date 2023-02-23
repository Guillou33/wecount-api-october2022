import { EmissionFactorTagLabel, EmissionFactorTagLabelRelation } from "@root/entity";
import { LOCALE } from "@root/entity/enum/Locale";
import { contentManager, emissionFactorManager } from "@root/manager";
import { EmissionFactorTagLabelRepository } from "@root/repository";
import { getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";

export enum CsvLine {
  TEMP_INGESTION_ID = 0,
  NAME_FR = 1,
  NAME_EN = 2,
  PARENT_IDS = 3,
}

export default class EfTagLabel2Ingestor extends AbstractBaseIngestor {

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
    efTagLabel.isRoot = false;
    efTagLabel.isFinal = true;

    await this.em.save(efTagLabel);

    const eftlMRelationsToSave: EmissionFactorTagLabelRelation[] = [];
    const parentIngestionIds = line[CsvLine.PARENT_IDS].split(',');
    for (const parentIngestionId of parentIngestionIds) {
      const formattedParentIngestionId = parentIngestionId.trim();
      const parentEmissionFactorTagLabel = await this.em.getCustomRepository(EmissionFactorTagLabelRepository).findOne({
        tempIngestionId: formattedParentIngestionId,
      });
      if (!parentEmissionFactorTagLabel) {
        throw new Error("Parent EFTL does not exist: " + parentIngestionId);
      }
      const eftlRelation = new EmissionFactorTagLabelRelation();
      eftlRelation.parentTag = parentEmissionFactorTagLabel;
      eftlRelation.childTag = efTagLabel;
      eftlMRelationsToSave.push(eftlRelation);
    }
    await this.em.save(eftlMRelationsToSave);
  }
}
