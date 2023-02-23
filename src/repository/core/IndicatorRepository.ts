import { Content, Indicator } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { EntityRepository, Repository, SelectQueryBuilder } from "typeorm";

@EntityRepository(Indicator)
export class IndicatorRepository extends Repository<Indicator> {
  async findOneWithMainRelations(indicatorId: number, customLocale?: LOCALE): Promise<Indicator | undefined> {
    const locale = customLocale ?? fallbackLocale;
    const queryBuilder = this.createQueryBuilder("i")
      .leftJoinAndSelect("i.campaign", "camp")
      .leftJoinAndSelect("camp.perimeter", "per")
      .leftJoinAndSelect("per.company", "c")
      .andWhere("i.softDeletedAt IS NULL")
      .andWhere("i.id = :indicatorId", {indicatorId});

    const activityEntry = await queryBuilder.getOne();

    return activityEntry;
  }
}
