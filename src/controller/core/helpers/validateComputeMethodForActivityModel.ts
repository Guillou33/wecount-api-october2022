import { ComputeMethod } from "@entity/index";
import { getManager } from "typeorm";
import { ComputeMethodRepository } from "@root/repository";

const validateComputeMethodForActivityModel = async (
  activityModelId: number,
  computeMethodId: number
): Promise<ComputeMethod> => {
  const em = getManager();

  const computeMethod = await em
    .getCustomRepository(ComputeMethodRepository)
    .getForActivityModel(activityModelId, computeMethodId);

  if (!computeMethod) {
    throw new Error("Invalid compute method");
  }

  return computeMethod;
};

export { validateComputeMethodForActivityModel };
