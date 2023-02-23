import { EmissionFactorMapping } from "@entity/index";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(EmissionFactorMapping)
export class EmissionFactorMappingRepository extends Repository<EmissionFactorMapping> {
}
