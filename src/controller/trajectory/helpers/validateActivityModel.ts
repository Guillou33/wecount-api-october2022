import { ActivityModel } from "@entity/index";
import { LOCALE } from "@root/entity/enum/Locale";
import { addActivityModelTranslations } from "@root/repository";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { getManager } from "typeorm";

const validateActivityModel = async (id: number, locale?: LOCALE): Promise<ActivityModel | null> => {
  const em = getManager();

  const qb = em
    .createQueryBuilder(ActivityModel, "am")
    .where("am.id = :id", { id });
  addActivityModelTranslations({
    queryBuilder: qb,
    asName: 'am',
    locale: locale ?? fallbackLocale,
  });
  const activityModel = await qb.getOne();

  return activityModel ?? null;
};

export { validateActivityModel };
