import { ActivityEntryReference } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(ActivityEntryReference)
export class ActivityEntryReferenceRepository extends Repository<ActivityEntryReference> {
}
