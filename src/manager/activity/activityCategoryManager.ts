import { ActivityCategory } from "@entity/index";
import AbstractManager from "@manager/AbstractManager";
import { SCOPE } from "@entity/enum/Scope";
import AbstractManagerWithRepository from "../AbstractManagerWithRepository";
import { ActivityCategoryRepository } from "@root/repository";
import { contentManager } from "@manager/index";

class ActivityCategoryManager extends AbstractManagerWithRepository<ActivityCategory, ActivityCategoryRepository> {
  protected entityClass = ActivityCategory;
  protected repositoryClass = ActivityCategoryRepository;

  async createNew(
    data: {
      name: string;
      scope: SCOPE;
      iconName: string | null;
      description: string | null;
      actionPlanHelp?: string;
      order?: number;
      ingestionTempId?: number;
    },
    flush: boolean = false
  ): Promise<ActivityCategory> {
    const contentName = await contentManager.createNew({
      prefix: 'activity_category_name',
      text: data.name,
    }, true);
    const nameContentCode = contentName.code

    let descriptionContentCode: string | null;
    if (data.description) {
      const contentDescription = await contentManager.createNew({
        prefix: 'activity_category_description',
        text: data.description,
      }, true);
      descriptionContentCode = contentDescription.code;
    } else {
      descriptionContentCode = null;
    }

    const activityCategory = this.instanceFromData({
      ...data,
      nameContentCode,
      descriptionContentCode,
    });

    if (flush) {
      await this.em.save(activityCategory);
    }

    return activityCategory;
  }

  async createOrGet(
    data: { name: string; scope: SCOPE; iconName: string | null; description: string | null; },
    flush: boolean = false
  ): Promise<ActivityCategory> {
    const foundCategory = await this.getRepository().findOneByAttr({
      name: data.name,
      iconName: data.iconName,
      description: data.description,
      scope: data.scope,
    });
    let activityCategory: ActivityCategory;
    if (foundCategory) {
      activityCategory = foundCategory;
    } else {
      activityCategory = await this.createNew(data, flush);
    }

    return activityCategory;
  }
}

export default new ActivityCategoryManager();
