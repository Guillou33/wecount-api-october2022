import { ActivityCategory } from "@entity/index";
import { getManager } from "typeorm";
import { NotFoundError } from "@deep/responseError/index";
import { addActivityCategoryTranslations } from "@root/repository";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";
import { LOCALE } from "@root/entity/enum/Locale";

const validateCategory = async (id: number, locale?: LOCALE): Promise<ActivityCategory> => {
  const em = getManager();

  const qb = em
    .createQueryBuilder(ActivityCategory, "ac")
    .where("ac.id = :id", { id });
  addActivityCategoryTranslations({
    queryBuilder: qb,
    asName: 'ac',
    locale: locale ?? fallbackLocale,
  });
  const category = await qb.getOne();


  if (category == null) {
    throw new NotFoundError();
  }
  return category;
};

export { validateCategory };
