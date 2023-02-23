import { ActivityModelPreference } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(ActivityModelPreference)
export class ActivityModelPreferenceRepository extends Repository<ActivityModelPreference> {
  async findActivityModelPreferenceForUser(
    perimeterId: number
  ): Promise<ActivityModelPreference | undefined> {
    const queryBuilder = this.createQueryBuilder("amp")
      .leftJoin("amp.perimeter", "perimeter")
      .leftJoinAndSelect("amp.visibleActivityModels", "activityModels")
      .leftJoinAndSelect("amp.categorySettings", "cs")
      .where("perimeter.id = :perimeterId", { perimeterId });
    return queryBuilder.getOne();
  }
}
