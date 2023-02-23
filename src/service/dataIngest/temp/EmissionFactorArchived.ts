import { ActivityModel, ComputeMethod, EmissionFactorMapping } from "@root/entity";
import { ComputeMode } from "@root/entity/enum/ComputeMode";
import { computeMethodManager, activityModelManager, emissionFactorManager, emissionFactorMappingManager } from "@root/manager";
import { DeepPartial, getManager } from "typeorm";
import AbstractBaseIngestor from "../AbstractBaseIngestor";
import { ArchivedReason, DbName, ElementType, InactiveReason } from "@root/entity/enum/EmissionFactorEnums";

export enum CsvLine {
  EMISSION_FACTOR_TYPE = 0,
  EMISSION_FACTOR_DB_ID = 1,
  EMISSION_FACTOR_STATUS = 2,
}

export default class EmissionFactorArchived extends AbstractBaseIngestor {

  private cmRepository;
  private efRepository;
  private efmRepository;
  private em;
  private dbName;

  constructor(csvPath: string, dbName: DbName) {
    super(csvPath);

    this.efRepository = emissionFactorManager.getRepository();
    this.cmRepository = computeMethodManager.getRepository();
    this.efmRepository = emissionFactorMappingManager.getRepository();
    this.em = getManager();
    this.dbName = dbName;
  }

  protected csvLength = 3;
  protected formatCsvTypes(value: string, index: number) {
    return value;
  } 

  async ingest(): Promise<void> {
    console.log(this.csvParsed.length);

    for (let i = 0; i < this.csvParsed.length; i++) {
      const line = this.csvParsed[i];
      this.checkLength(line);

      if (!line[CsvLine.EMISSION_FACTOR_DB_ID]) {
        continue;
      }

      console.log(i);

      try {
        const isPoste = line[CsvLine.EMISSION_FACTOR_TYPE].toLowerCase() === 'poste';
        const isInactive = isPoste || (line[CsvLine.EMISSION_FACTOR_STATUS].toLowerCase().indexOf('archiv') === -1 && line[CsvLine.EMISSION_FACTOR_STATUS].toLowerCase().indexOf('valide') === -1);

        const ef = await this.efRepository.findOneOrFail({
          dbId: line[CsvLine.EMISSION_FACTOR_DB_ID],
          elementType: isPoste ? ElementType.POSTE : ElementType.ELEMENT,
          dbName: this.dbName,
        });

        ef.archived = (!isPoste && line[CsvLine.EMISSION_FACTOR_STATUS].toLowerCase().indexOf('archiv') !== -1);
        ef.archivedReason = (!isPoste && line[CsvLine.EMISSION_FACTOR_STATUS].toLowerCase().indexOf('archiv') !== -1) ? ArchivedReason.OTHER : null;
        ef.inactive = isInactive;
        ef.inactiveReason = isInactive ? (isPoste ? InactiveReason.POSTE : InactiveReason.OTHER) : null;
        ef.inactiveComment = isInactive ? line[CsvLine.EMISSION_FACTOR_STATUS] : null;
        ef.wecountComment = line[CsvLine.EMISSION_FACTOR_STATUS];

        await this.em.save(ef);
      } catch (error: any) {
        console.log('error', error);
      }
    }

    console.log('END');
  }
}
