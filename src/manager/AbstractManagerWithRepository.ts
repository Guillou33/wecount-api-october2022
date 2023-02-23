import { getManager, EntityManager, Repository } from "typeorm";
import AbstractManager from "@manager/AbstractManager";

export default abstract class AbstractManagerWithRepository<EntityType, RepositoryType> extends AbstractManager<EntityType> {
  protected abstract repositoryClass: new () => RepositoryType;

  getRepository(): RepositoryType {
    return this.em.getCustomRepository(this.repositoryClass);
  }
}