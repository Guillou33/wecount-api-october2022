import { getManager, EntityManager, Repository, DeepPartial } from "typeorm";

export default abstract class AbstractManager<EntityType> {
  private rawEm: EntityManager;
  protected abstract entityClass: new () => EntityType;

  protected instance(): EntityType {
    return new this.entityClass();
  }

  protected instanceFromData(data: DeepPartial<EntityType>): EntityType {
    return this.em.create(this.entityClass, data);
  }

  protected get em(): EntityManager {
    if (!this.rawEm) {
      this.rawEm = getManager();
    }
    
    return this.rawEm;
  }
}