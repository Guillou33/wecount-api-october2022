import { User, CampaignTrajectory } from "@entity/index";
import { getManager } from "typeorm";
import { AccessDeniedError, NotFoundError } from "@deep/responseError/index";
import { addActivityCategoryTranslations, addActivityModelTranslations } from "@root/repository";
import { fallbackLocale } from "@root/service/core/translation/defaultLocale";

const validateTrajectory = async (
  id: number,
  userWithCompany: User
): Promise<CampaignTrajectory> => {
  if (!userWithCompany.company) {
    throw new Error("User have no company");
  }

  const locale = userWithCompany.locale ?? fallbackLocale;
  const em = getManager();
  const qb = em
    .createQueryBuilder(CampaignTrajectory, "ct")
    .select(["ct","am.id", "a"])
    .leftJoinAndSelect("ct.campaign", "c")
    .leftJoinAndSelect("c.perimeter", "p")
    .leftJoinAndSelect("p.company", "company")
    .leftJoinAndSelect("ct.actionPlans", "ap", "ap.softDeletedAt IS NULL")
    .leftJoin("ap.action", "a")
    .leftJoinAndSelect("ap.category", "cat")
    .leftJoin("ap.activityModel", "am");
  addActivityCategoryTranslations({
    queryBuilder: qb,
    asName: "cat",
    locale,
  });
  addActivityModelTranslations({
    queryBuilder: qb,
    asName: "am",
    locale,
  });
  qb.where("ct.id = :id", { id });
  
  const trajectory = await qb.getOne();

  if (!trajectory) {
    throw new NotFoundError();
  }

  if (userWithCompany.company.id !== trajectory.campaign.perimeter.company.id) {
    throw new AccessDeniedError();
  }

  return trajectory;
};

export { validateTrajectory };
