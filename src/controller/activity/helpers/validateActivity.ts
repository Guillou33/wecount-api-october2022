import { User, Activity } from "@entity/index";
import { getManager } from "typeorm";
import { AccessDeniedError, NotFoundError } from "@deep/responseError/index";
import { ActivityRepository } from "@root/repository";

const validateActivity = async (
  activityId: number,
  userWithCompany: User
): Promise<Activity> => {
  if (!userWithCompany.company) {
    throw new Error("User have no company");
  }

  const em = getManager();
  const activityRepository = em.getCustomRepository(ActivityRepository);
  const activity = await activityRepository.findOneWithMainRelations(activityId, userWithCompany.locale ?? undefined);

  if (!activity) {
    throw new NotFoundError();
  }

  if (userWithCompany.company.id !== activity.campaign.perimeter.company.id) {
    throw new AccessDeniedError();
  }

  return activity;
};

export { validateActivity };