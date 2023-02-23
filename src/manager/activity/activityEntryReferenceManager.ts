import AbstractManagerWithRepository from "@root/manager/AbstractManagerWithRepository";
import { ActivityEntryReferenceRepository } from "@repository/index";
import { ActivityEntryReference } from "@root/entity/activity/ActivityEntryReference";
import { randomUpperToken } from "@root/service/utils/tokenGenerator";
import { Activity } from "@root/entity";
import { activityManager } from "..";

const REFERENCE_ID_LENGTH = 5;

class ActivityEntryReferenceManager extends AbstractManagerWithRepository<
  ActivityEntryReference,
  ActivityEntryReferenceRepository
> {
  protected entityClass = ActivityEntryReference;
  protected repositoryClass = ActivityEntryReferenceRepository;

  async createNew(data: {
    activityId: number;
  }, flush = false): Promise<ActivityEntryReference> {
    const aer = new ActivityEntryReference();
    aer.rawReferenceId = await this.generateRawReferenceId();
    const numberCodes = await activityManager.getRepository().findNumberCodes(data.activityId);
    aer.referenceId = `${numberCodes.categoryNumberCode}-${numberCodes.modelNumberCode}-${aer.rawReferenceId}`;

    if (flush) {
      await this.em.save(aer);
    }

    return aer;
  }

  private async generateRawReferenceId(): Promise<string> {
    let rawReferenceId: string;
    let existingAER: ActivityEntryReference | undefined;
    let i = 0;
    do {
      rawReferenceId = randomUpperToken(REFERENCE_ID_LENGTH);
      existingAER = await this.getRepository().findOne({
        rawReferenceId
      });

      const maxTries = 15;
      if (++i > 15) {
        throw new Error(`can't find unique rawReferenceId after ${maxTries} tries.`);
      }
    }
    while (existingAER);

    return rawReferenceId;
  }
}

export default new ActivityEntryReferenceManager();
