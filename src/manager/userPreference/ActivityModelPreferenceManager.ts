import AbstractManagerWithRepository from "@manager/AbstractManagerWithRepository";
import {
  ActivityModelPreference,
  ActivityModel,
  ActivityCategorySetting,
  ActivityCategory,
  Perimeter,
} from "@entity/index";
import { ActivityModelPreferenceRepository } from "@root/repository/userPreference/ActivityModelRepository";
import { In } from "typeorm";

export type CategorySettingData = {
  activityCategoryId: number;
  order: number | null;
  description: string | null;
};

class ActivityModelPreferenceManager extends AbstractManagerWithRepository<
  ActivityModelPreference,
  ActivityModelPreferenceRepository
> {
  protected entityClass = ActivityModelPreference;
  protected repositoryClass = ActivityModelPreferenceRepository;

  private getDefaultVisibleActivityModels() {
    const activityModelRepository = this.em.getRepository(ActivityModel);
    return activityModelRepository.find({ visibleByDefault: true });
  }

  private async getDefaultCategorySettings() {
    const categorySettingRepository = this.em.getRepository(
      ActivityCategorySetting
    );
    const categoryRepository = this.em.getRepository(ActivityCategory);
    const categories = await categoryRepository.find();

    return categories.map(category => {
      const defaultCategorySetting = categorySettingRepository.create();
      defaultCategorySetting.activityCategoryId = category.id;
      defaultCategorySetting.order = category.order;
      return defaultCategorySetting;
    });
  }

  private async getActivityModelPreferenceInstance(
    perimeter: Perimeter
  ): Promise<ActivityModelPreference> {
    let preference =
      await this.getRepository().findActivityModelPreferenceForUser(perimeter.id);

    if (preference == null) {
      preference = this.getRepository().create();
      preference.perimeter = perimeter;
      preference.categorySettings = [];
    }
    return preference;
  }

  async getVisibleActivityModelsFor(
    perimeter: Perimeter
  ): Promise<ActivityModel[]> {
    const activityModelPreferences =
      await this.getRepository().findActivityModelPreferenceForUser(perimeter.id);
    if (
      activityModelPreferences == null ||
      activityModelPreferences.visibleActivityModels.length === 0
    ) {
      return this.getDefaultVisibleActivityModels();
    }
    return activityModelPreferences.visibleActivityModels;
  }

  async upsertVisibleActivityModels(
    perimeter: Perimeter,
    newVisibleactivityModelsUniqueNames: string[]
  ): Promise<ActivityModelPreference> {
    const preference = await this.getActivityModelPreferenceInstance(perimeter);

    const visibleActivityModels = await this.em
      .getRepository(ActivityModel)
      .find({ uniqueName: In(newVisibleactivityModelsUniqueNames) });

    if (visibleActivityModels.length > 0) {
      preference.visibleActivityModels = visibleActivityModels;
      await this.em.save(preference);
    }
    return preference;
  }

  async getCategorySettingsFor(
    perimeter: Perimeter
  ): Promise<ActivityCategorySetting[]> {
    const activityModelPreferences = await this.getRepository().findOne({
      relations: ["perimeter", "categorySettings"],
      where: { perimeter },
    });

    const defaultCategorySettings = await this.getDefaultCategorySettings();

    if (
      activityModelPreferences == null ||
      activityModelPreferences.categorySettings == null
    ) {
      return defaultCategorySettings;
    }

    const categorySettingsById =
      activityModelPreferences.categorySettings.reduce((acc, setting) => {
        acc[setting.activityCategoryId] = setting;
        return acc;
      }, {} as { [categoryId: number]: ActivityCategorySetting });

    const categorySettingsOverrideDefault = defaultCategorySettings.map(
      defaultSetting => {
        const existingSetting =
          categorySettingsById[defaultSetting.activityCategoryId];

        if (existingSetting == null) {
          return defaultSetting;
        }

        return {
          ...defaultSetting,
          order: existingSetting.order ?? defaultSetting.order,
          description:
            existingSetting.description ?? defaultSetting.description,
        };
      }
    );

    return categorySettingsOverrideDefault;
  }

  async upsertCategorySettings(
    perimeter: Perimeter,
    newCategorySettings: CategorySettingData[]
  ): Promise<ActivityCategorySetting[]> {
    const preference = await this.getActivityModelPreferenceInstance(perimeter);
    await this.em.save(preference);

    const categorySettingsById = preference.categorySettings.reduce(
      (acc, setting) => {
        acc[setting.activityCategoryId] = setting;
        return acc;
      },
      {} as { [categoryId: number]: ActivityCategorySetting }
    );

    const { settingsToUpdate, settingsToCreate } = newCategorySettings.reduce(
      (acc, setting) => {
        if (categorySettingsById[setting.activityCategoryId] != null) {
          acc.settingsToUpdate.push(setting);
        } else {
          acc.settingsToCreate.push(setting);
        }
        return acc;
      },
      { settingsToUpdate: [], settingsToCreate: [] } as {
        settingsToUpdate: CategorySettingData[];
        settingsToCreate: CategorySettingData[];
      }
    );

    settingsToUpdate.forEach(setting => {
      const { activityCategoryId, description, order } = setting;
      const existingSetting = categorySettingsById[activityCategoryId];

      existingSetting.description = description ?? existingSetting.description;
      existingSetting.order = order ?? existingSetting.order;
    });

    const updateSettingsPromises = Object.values(categorySettingsById).map(
      setting => this.em.save(setting)
    );

    const newSettingsPromises = settingsToCreate.map(async setting => {
      const { activityCategoryId, description, order } = setting;
      const activityCategory = await this.em
        .getRepository(ActivityCategory)
        .findOne(activityCategoryId);

      if (activityCategory != null) {
        const newSetting = this.em
          .getRepository(ActivityCategorySetting)
          .create();

        newSetting.activityCategory = activityCategory;
        newSetting.activityModelPreference = preference;
        newSetting.order = order;
        newSetting.description = description;

        return this.em.save(newSetting);
      }
    });


    const updatedSettings = await Promise.all([
      ...newSettingsPromises,
      ...updateSettingsPromises,
    ]);



    return updatedSettings.filter(
      (setting): setting is NonNullable<typeof setting> => setting != null
    );
  }
}

export default new ActivityModelPreferenceManager();
