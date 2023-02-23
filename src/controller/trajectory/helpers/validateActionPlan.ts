import { User, ActionPlan } from "@entity/index";
import { getManager } from "typeorm";
import { NotFoundError } from "@deep/responseError/index";
import { validateTrajectory } from "@controller/trajectory/helpers/validateTrajectory";
import { addActivityModelTranslations } from "@root/repository";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";

const validateActionPlan = async (
  id: number,
  userWithCompany: User
): Promise<ActionPlan> => {
  if (!userWithCompany.company) {
    throw new Error("User have no company");
  }

  const em = getManager();

  const qb = em
    .createQueryBuilder(ActionPlan, "ap")
    .leftJoinAndSelect('ap.campaignTrajectory', 'ct')
    .leftJoinAndSelect('ap.activityModel', 'am')
    .where("ap.id = :id", { id });
  addActivityModelTranslations({
    queryBuilder: qb,
    asName: 'am',
    locale: userWithCompany.locale ?? fallbackLocale,
  });
  const actionPlan = await qb.getOne();

  if (actionPlan == null) {
    throw new NotFoundError();
  }

  validateTrajectory(actionPlan.campaignTrajectory.id, userWithCompany);

  return actionPlan;
};

export { validateActionPlan };
