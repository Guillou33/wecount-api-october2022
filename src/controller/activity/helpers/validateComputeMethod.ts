import { ComputeMethod } from "@entity/index";
import { getManager } from "typeorm";
import { ComputeMethodRepository } from "@root/repository";
import { LOCALE } from "@root/entity/enum/Locale";

const validateComputeMethodForActivity = async (
  activityId: number,
  computeMethodId: number,
  locale?: LOCALE,
): Promise<ComputeMethod> => {

  const em = getManager();

  const computeMethod = await em.getCustomRepository(ComputeMethodRepository).getForActivity(activityId, computeMethodId, locale ?? undefined);

  if (!computeMethod) {
    throw new Error("Invalid compute method")
  }

  return computeMethod;
};

export { validateComputeMethodForActivity };