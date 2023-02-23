import { User, TrajectorySettings } from "@entity/index";
import { getManager } from "typeorm";
import { NotFoundError } from "@deep/responseError/index";

async function validateTrajectorySettings(
  id: number,
  userWithCompany: User
): Promise<TrajectorySettings> {
  const em = getManager();

  const trajectorySettings = await em.findOne(TrajectorySettings, {
    relations: ["scopeTargets", "perimeter", "perimeter.company"],
    where: { id },
  });

  if (trajectorySettings == null) {
    throw new NotFoundError();
  }

  return trajectorySettings;
}

export { validateTrajectorySettings };
