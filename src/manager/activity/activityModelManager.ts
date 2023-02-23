import { ActivityModel, ActivityCategory } from "@entity/index";
import AbstractManagerWithRepository from "@manager/AbstractManagerWithRepository";
import { ActivityModelRepository } from "@repository/index";
import { generateActivityModelUniqueName } from "@service/utils/uniqueNameGenerator";
import { contentManager } from "..";

class ActivityModelManager extends AbstractManagerWithRepository<ActivityModel, ActivityModelRepository> {
  protected entityClass = ActivityModel;
  protected repositoryClass = ActivityModelRepository;

  async createNew(
    data: { 
      activityCategory: ActivityCategory,
      name: string,
      description?: string,
      help?: string,
      seeMore?: string,
      isPrivate?: boolean;
      archivedDate?: Date | null;
      visibleByDefault?: boolean;
      ingestionTempId?: number | null;
    },
    flush: boolean = false
  ): Promise<ActivityModel> {

    const nameContentCode = await contentManager.createAndGetContentCode({
      prefix: 'activity_model_name',
      text: data.name,
    });
    const descriptionContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'activity_model_description',
      text: data.description,
    });
    const helpContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'activity_model_help',
      text: data.help,
    });
    const seeMoreContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'activity_model_seeMore',
      text: data.seeMore,
    });

    const categoryName = await contentManager.getRepository().findTextByCode(data.activityCategory.nameContentCode);
    const formattedData = {
      ...data,
      uniqueName: generateActivityModelUniqueName(
        data.activityCategory,
        categoryName ?? '',
        data.name,
        Object.values(data).join()
      ),
      nameContentCode,
      descriptionContentCode,
      helpContentCode,
      seeMoreContentCode,
    };
    const activityModel = this.instanceFromData(formattedData);

    if (flush) {
      await this.em.save(activityModel);
    }

    return activityModel;
  }

  async createOrModify(
    data: { 
      activityCategory: ActivityCategory,
      name: string,
      description?: string,
      help?: string,
      seeMore?: string,
      isPrivate?: boolean;
      archivedDate?: Date | null;
      visibleByDefault?: boolean;
      ingestionTempId?: number | null;
    },
    flush: boolean = false
  ): Promise<ActivityModel> {
    const foundActivityModel = await this.getRepository().findOneByAttr({
      activityCategory: data.activityCategory,
      name: data.name,
    });
    let activityModel: ActivityModel;
    if (foundActivityModel) {
      contentManager.getRepository().removeContentByCodes([foundActivityModel.nameContentCode, foundActivityModel.descriptionContentCode, foundActivityModel.helpContentCode, foundActivityModel.seeMoreContentCode]);
      const nameContentCode = await contentManager.createAndGetContentCode({
        prefix: 'activity_model_name',
        text: data.name,
      });
      const descriptionContentCode = await contentManager.createAndGetNullableContentCode({
        prefix: 'activity_model_description',
        text: data.description,
      });
      const helpContentCode = await contentManager.createAndGetNullableContentCode({
        prefix: 'activity_model_help',
        text: data.help,
      });
      const seeMoreContentCode = await contentManager.createAndGetNullableContentCode({
        prefix: 'activity_model_seeMore',
        text: data.seeMore,
      });
  
      activityModel = this.em.merge(ActivityModel, foundActivityModel, {
        ...data,
        nameContentCode,
        descriptionContentCode,
        helpContentCode,
        seeMoreContentCode,
      });
      if (flush) {
        await this.em.save(activityModel);
      }
    } else {
      activityModel = await this.createNew(data, flush);
    }

    return activityModel;
  }
}

export default new ActivityModelManager();
