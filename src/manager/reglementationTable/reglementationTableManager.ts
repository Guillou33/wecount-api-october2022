import { ReglementationTable } from "@root/entity";

import AbstractManagerWithRepository from "../AbstractManagerWithRepository";
import {
  addReglementationCategoryTranslations,
  addReglementationSubCategoryTranslations,
  addReglementationTableTranslations,
  ReglementationTableRepository,
} from "@root/repository";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { LOCALE } from "@root/entity/enum/Locale";

class ReglementationTableManager extends AbstractManagerWithRepository<
  ReglementationTable,
  ReglementationTableRepository
> {
  protected entityClass = ReglementationTable;
  protected repositoryClass = ReglementationTableRepository;

  async getAllTablesStructure({
    customLocale,
  }: {
    customLocale?: LOCALE;
  }): Promise<ReglementationTable[]> {
    const locale = customLocale ?? fallbackLocale;
    const qb = this.em.createQueryBuilder(ReglementationTable, "rt");
    qb.leftJoinAndSelect("rt.reglementationCategories", "rtc")
      .leftJoinAndSelect("rtc.reglementationSubCategories", "rtsc")
      .orderBy("rtc.position, rtsc.position");
    addReglementationTableTranslations({
      queryBuilder: qb,
      asName: "rt",
      locale,
    });
    addReglementationCategoryTranslations({
      queryBuilder: qb,
      asName: "rtc",
      locale,
    });
    addReglementationSubCategoryTranslations({
      queryBuilder: qb,
      asName: "rtsc",
      locale,
    });
    return qb.getMany();
  }
}

export default new ReglementationTableManager();
