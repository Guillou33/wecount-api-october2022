import { PossibleAction } from "@entity/index";
import { getManager } from "typeorm";

const validateAction = async (id: number): Promise<PossibleAction | null> => {
  const em = getManager();

  const action = await em.getRepository(PossibleAction).findOne({ id });

  return action ?? null;
};

export { validateAction };
