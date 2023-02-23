import AbstractManager from "@root/manager/AbstractManager";
import {
  ActivityEntryResultBEGES,
  ActivityEntryResultGHG,
  ActivityEntryResultISO,
  ActivityEntry,
  EmissionFactor,
  ReglementationSubCategory,
  EmissionFactorInfo,
  Campaign,
} from "@root/entity";
import { ReglementationTableCode } from "@root/entity/enum/ReglementationTableCode";

import { campaignManager } from "@root/manager";
import getRepartitionForActivityEntry from "@root/service/reglementationTable/getRepartitionForActivityEntry";

type Result =
  | ActivityEntryResultBEGES
  | ActivityEntryResultGHG
  | ActivityEntryResultISO;

export type GetFreshInstanceArgs = {
  campaign: Campaign | undefined;
  activityEntry: ActivityEntry;
  subCategory: ReglementationSubCategory;
};

export default abstract class AbstractActivityEntryResultManager<
  EntityType extends Result
> extends AbstractManager<EntityType> {
  protected abstract tableCode: ReglementationTableCode;

  protected abstract getFreshInstance(args: GetFreshInstanceArgs): EntityType;
  protected abstract initInstanceSpecificData(instance: EntityType): void;
  protected abstract setSpecificGases(
    instance: EntityType,
    emissionFactor: EmissionFactor,
    emissionFactorInfo: EmissionFactorInfo | undefined
  ): Promise<void>;

  async findExistingResult(entryId: number, subCategoryId: number) {
    const qb = this.em
      .createQueryBuilder(this.entityClass, "aer")
      .leftJoin("aer.activityEntry", "ae")
      .leftJoin("aer.subCategory", "sc")
      .where(
        "ae.id = :entryId AND sc.id=:subCategoryId AND aer.deleted_at IS NULL",
        {
          entryId,
          subCategoryId,
        }
      );
    return qb.getOne();
  }

  async archiveResultsOfEntry(entryId: number) {
    const resultsOfEntry = await this.em
      .createQueryBuilder(this.entityClass, "aer")
      .leftJoin("aer.activityEntry", "ae")
      .where("ae.id = :entryId", { entryId })
      .getMany();
    return resultsOfEntry.map(result => this.em.softRemove(result));
  }

  async getResultsOfCampaign(campaignId: number) {
    const qb = this.em
      .createQueryBuilder(this.entityClass, "aer")
      .leftJoin("aer.campaign", "c")
      .where("c.id = :campaignId AND aer.deletedAt IS NULL", { campaignId });
    return qb.getMany();
  }

  async saveOrUpdateResult(entry: ActivityEntry) {
    const repartitionsBySubCategory = await getRepartitionForActivityEntry(
      entry,
      this.tableCode
    );

    Object.entries(repartitionsBySubCategory).forEach(
      async ([subCategoryIdStr, repartitions]) => {
        const subCategoryId = Number(subCategoryIdStr);

        let instance = await this.findExistingResult(entry.id, subCategoryId);

        if (instance == null) {
          const campaign = await campaignManager
            .getRepository()
            .findOneForActivityEntry(entry.id);
          const subCategory = await this.em.findOneOrFail(
            ReglementationSubCategory,
            { where: { id: subCategoryId } }
          );

          instance = this.getFreshInstance({
            campaign,
            activityEntry: entry,
            subCategory,
          });

          this.initInstanceCommonData(instance);
        }

        const { result, uncertainties } = repartitions.reduce(
          (acc, repartition) => {
            const result = repartition.ratio * entry.resultTco2;
            const uncertainty =
              (Math.sqrt(
                entry.uncertainty ** 2 +
                  ((entry?.emissionFactor?.uncertainty ?? 0) / 100) ** 2
              ) * result);
            acc.result += result;
            acc.uncertainties.push(uncertainty);
            return acc;
          },
          { result: 0, uncertainties: [] as number[] }
        );

        instance.result = result;
        instance.uncertainty = Math.sqrt(
          uncertainties.reduce((acc, uncertainty) => {
            return acc + uncertainty ** 2;
          }, 0)
        );

        if (entry.emissionFactor != null) {
          await this.setCommonGases(instance, entry.emissionFactor);
        }
        return this.em.save(instance);
      }
    );
  }

  private initInstanceCommonData(instance: EntityType) {
    instance.ch4 = 0;
    instance.co2 = 0;
    instance.n2O = 0;
    instance.otherGaz = 0;

    this.initInstanceSpecificData(instance);
  }

  private async setCommonGases(
    instance: EntityType,
    emissionFactor: EmissionFactor
  ) {
    const emissionFactorInfo = await this.em
      .createQueryBuilder(EmissionFactorInfo, "efi")
      .select([
        "efi.cH4f",
        "efi.cO2f",
        "efi.n2O",
        "efi.cO2b",
        "efi.autreGES",
        "efi.valeurGazSupplementaire",
        "efi.valeurGazSupplementaire2",
        "efi.valeurGazSupplementaire3",
        "efi.valeurGazSupplementaire4",
        "efi.valeurGazSupplementaire5",
      ])
      .leftJoin(EmissionFactor, "ef", "efi.id=ef.emission_factor_info_id")
      .where("ef.id = :efId", { efId: emissionFactor.id })
      .getOne();
    const {
      cH4f,
      cO2f,
      n2O,
      autreGES,
      valeurGazSupplementaire,
      valeurGazSupplementaire2,
      valeurGazSupplementaire3,
      valeurGazSupplementaire4,
      valeurGazSupplementaire5,
    } = emissionFactorInfo ?? {};

    const otherGes = [
      autreGES,
      valeurGazSupplementaire,
      valeurGazSupplementaire2,
      valeurGazSupplementaire3,
      valeurGazSupplementaire4,
      valeurGazSupplementaire5,
    ].reduce((acc: number, gazValue) => {
      return acc + (gazValue ?? 0);
    }, 0);

    if (emissionFactor.value !== 0) {
      instance.ch4 = (instance.result * (cH4f ?? 0)) / emissionFactor.value;
      instance.co2 = (instance.result * (cO2f ?? 0)) / emissionFactor.value;
      instance.n2O = (instance.result * (n2O ?? 0)) / emissionFactor.value;
      instance.otherGaz =
        (instance.result * (otherGes ?? 0)) / emissionFactor.value;

      await this.setSpecificGases(instance, emissionFactor, emissionFactorInfo);
    }

    if (
      [instance.ch4, instance.co2, instance.n2O, instance.otherGaz].every(
        value => value === 0
      )
    ) {
      instance.co2 = instance.result;
    }
  }
}
