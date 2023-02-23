import { User, ActivityEntry } from "@entity/index";
import { getManager } from "typeorm";
import { AccessDeniedError, NotFoundError } from "@deep/responseError/index";
import { ActivityEntryRepository } from "@root/repository";

const validateActivityEntry = async (
  activityEntryId: number,
  userWithCompany: User
): Promise<ActivityEntry> => {
  if (!userWithCompany.company) {
    throw new Error("User have no company");
  }

  const em = getManager();
  const activityEntryRepository = em.getCustomRepository(ActivityEntryRepository);

  const activityEntry = await activityEntryRepository.findOneWithMainRelations(activityEntryId);

  if (!activityEntry) {
    throw new NotFoundError();
  }

  if (
    userWithCompany.company.id !==
    activityEntry.activity.campaign.perimeter.company.id
  ) {
    throw new AccessDeniedError();
  }

  return activityEntry;
};

export { validateActivityEntry };
