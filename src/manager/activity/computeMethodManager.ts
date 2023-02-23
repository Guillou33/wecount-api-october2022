import { ActivityModel, ComputeMethod } from "@entity/index";
import AbstractManagerWithRepositoty from "@root/manager/AbstractManagerWithRepository";
import { ComputeMethodRepository } from "@repository/index";
import { ComputeMode } from "@root/entity/enum/ComputeMode";
import { contentManager } from "..";

class ComputeMethodManager extends AbstractManagerWithRepositoty<ComputeMethod, ComputeMethodRepository> {
  protected entityClass = ComputeMethod;
  protected repositoryClass = ComputeMethodRepository;

  async createOrModify(
    data: { 
      activityModel: ActivityModel,
      name: string,
      position: number,
      isDefault: boolean,
      description?: string,
      valueName?: string,
      value2Name?: string,
      emissionFactorLabel?: string,
      specialComputeMode?: ComputeMode | null,
      archivedDate?: Date | null,
      ingestionTempId?: number | null,
    },
    flush: boolean = false
  ): Promise<ComputeMethod> {
    const foundComputeMethod = await this.getRepository().findOneByAttr({
      activityModel: data.activityModel,
      name: data.name,
      position: data.position,
      isDefault: data.isDefault,
    });

    let computeMethod: ComputeMethod;
    if (foundComputeMethod) {
      contentManager.getRepository().removeContentByCode(foundComputeMethod.nameContentCode);
      contentManager.getRepository().removeContentByCode(foundComputeMethod.descriptionContentCode);
      contentManager.getRepository().removeContentByCode(foundComputeMethod.valueNameContentCode);
      contentManager.getRepository().removeContentByCode(foundComputeMethod.value2NameContentCode);
      contentManager.getRepository().removeContentByCode(foundComputeMethod.emissionFactorLabelContentCode);
      const nameContentCode = await contentManager.createAndGetContentCode({
        prefix: 'cm_name',
        text: data.name,
      });
      const descriptionContentCode = await contentManager.createAndGetNullableContentCode({
        prefix: 'cm_description',
        text: data.description,
      });
      const valueNameContentCode = await contentManager.createAndGetContentCode({
        prefix: 'cm_value_name',
        text: data.valueName!,
      });
      const value2NameContentCode = await contentManager.createAndGetNullableContentCode({
        prefix: 'cm_value_2_name',
        text: data.value2Name,
      });
      const emissionFactorLabelContentCode = await contentManager.createAndGetNullableContentCode({
        prefix: 'cm_emission_factor_label',
        text: data.emissionFactorLabel,
      });
  
      const formattedData = {
        ...data,
        nameContentCode,
        descriptionContentCode,
        valueNameContentCode,
        value2NameContentCode,
        emissionFactorLabelContentCode,
      };

      computeMethod = this.em.merge(ComputeMethod, foundComputeMethod, formattedData);
      if (flush) {
        await this.em.save(computeMethod);
      }
    } else {
      computeMethod = await this.createNew(data, flush);
    }

    return computeMethod;
  }

  async createNew(
    data: { 
      activityModel: ActivityModel,
      name: string,
      position: number,
      isDefault: boolean,
      description?: string,
      valueName?: string,
      value2Name?: string,
      emissionFactorLabel?: string,
      specialComputeMode?: ComputeMode | null,
      archivedDate?: Date | null,
      ingestionTempId?: number | null,
    },
    flush: boolean = false
  ): Promise<ComputeMethod> {

    const nameContentCode = await contentManager.createAndGetContentCode({
      prefix: 'cm_name',
      text: data.name,
    });
    const descriptionContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'cm_description',
      text: data.description,
    });
    const valueNameContentCode = await contentManager.createAndGetContentCode({
      prefix: 'cm_value_name',
      text: data.valueName!,
    });
    const value2NameContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'cm_value_2_name',
      text: data.value2Name,
    });
    const emissionFactorLabelContentCode = await contentManager.createAndGetNullableContentCode({
      prefix: 'cm_emission_factor_label',
      text: data.emissionFactorLabel,
    });

    const formattedData = {
      ...data,
      nameContentCode,
      descriptionContentCode,
      valueNameContentCode,
      value2NameContentCode,
      emissionFactorLabelContentCode,
    };

    const computeMethod = this.instanceFromData(formattedData);

    if (flush) {
      await this.em.save(computeMethod);
    }

    return computeMethod;
  }
}

export default new ComputeMethodManager();
