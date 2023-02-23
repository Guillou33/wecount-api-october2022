import { EmissionFactorMapping, EmissionFactor } from "@entity/index";
import AbstractManager from "@manager/AbstractManager";
import { EmissionFactorMappingRepository } from "@root/repository";
import AbstractManagerWithRepository from "../AbstractManagerWithRepository";

class EmissionFactorMappingManager extends AbstractManagerWithRepository<EmissionFactorMapping, EmissionFactorMappingRepository> {
  protected entityClass = EmissionFactorMapping;
  protected repositoryClass = EmissionFactorMappingRepository;
}

export default new EmissionFactorMappingManager();
