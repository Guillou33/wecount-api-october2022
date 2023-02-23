import { Company, CustomEmissionFactor, Perimeter } from "@entity/index";
import AbstractManagerWithRepository from "@root/manager/AbstractManagerWithRepository";
import {
  CustomEmissionFactorRepository,
} from "@repository/index";

class CustomEmissionFactorManager extends AbstractManagerWithRepository<
  CustomEmissionFactor,
  CustomEmissionFactorRepository
> {
  protected entityClass = CustomEmissionFactor;
  protected repositoryClass = CustomEmissionFactorRepository;

  async create({
    perimeter,
    value,
    name,
    input1Name,
    input1Unit,
    source,
    comment,
  }: {
    perimeter: Perimeter;
    value: number;
    name: string;
    input1Name: string;
    input1Unit: string;
    source?: string;
    comment?: string;
  }): Promise<CustomEmissionFactor> {
    const cef = this.instanceFromData({
      perimeter,
      value,
      name,
      input1Name,
      input1Unit,
      source,
      comment: comment ?? null,
    });
    await this.em.save(cef);

    return cef;
  }

  async update(
    customEmissionFactor: CustomEmissionFactor,
    dataToMerge: {
      value: number;
      name: string;
      input1Name: string;
      input1Unit: string;
      source?: string;
      comment?: string;
    }
  ): Promise<CustomEmissionFactor> {
    this.em.merge(CustomEmissionFactor, customEmissionFactor, {
      ...dataToMerge,
      source: dataToMerge.source ?? null,
      comment: dataToMerge.comment ?? null,
    });
    await this.em.save(customEmissionFactor);

    return customEmissionFactor;
  }

  async archive(
    customEmissionFactor: CustomEmissionFactor,
  ): Promise<CustomEmissionFactor> {
    this.em.merge(CustomEmissionFactor, customEmissionFactor, {
      archivedDate: new Date(),
    });
    await this.em.save(customEmissionFactor);

    return customEmissionFactor;
  }

  async unarchive(
    customEmissionFactor: CustomEmissionFactor,
  ): Promise<CustomEmissionFactor> {
    this.em.merge(CustomEmissionFactor, customEmissionFactor, {
      archivedDate: null,
    });
    await this.em.save(customEmissionFactor);

    return customEmissionFactor;
  }
}

export default new CustomEmissionFactorManager();
